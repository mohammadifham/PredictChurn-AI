import json
import os
import hashlib
import hmac
from pathlib import Path

# Use absolute path to ensure consistency across all running contexts
PROJECT_ROOT = Path(__file__).resolve().parents[1]
USERS_FILE = str(PROJECT_ROOT / "backend" / "users.json")
HASH_ITERATIONS = int(os.getenv("AUTH_HASH_ITERATIONS", "200000"))


def _legacy_hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt),
        HASH_ITERATIONS,
    ).hex()
    return f"pbkdf2_sha256${HASH_ITERATIONS}${salt}${derived}"


def _verify_password(password: str, stored_hash: str) -> bool:
    if stored_hash.startswith("pbkdf2_sha256$"):
        try:
            _, iterations, salt, expected = stored_hash.split("$", 3)
            derived = hashlib.pbkdf2_hmac(
                "sha256",
                password.encode("utf-8"),
                bytes.fromhex(salt),
                int(iterations),
            ).hex()
            return hmac.compare_digest(derived, expected)
        except (TypeError, ValueError):
            return False

    # Backward compatibility for existing users created with plain SHA256.
    legacy = _legacy_hash_password(password)
    return hmac.compare_digest(legacy, stored_hash)


def _normalize_username(username: str) -> str:
    return username.strip()


def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            users = json.load(f)
            return users if isinstance(users, dict) else {}
    except (json.JSONDecodeError, OSError):
        return {}


def save_users(users: dict):
    temp_file = f"{USERS_FILE}.tmp"
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)
    os.replace(temp_file, USERS_FILE)


def create_default_admin():
    if os.getenv("CREATE_DEFAULT_ADMIN", "true").strip().lower() != "true":
        return

    admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin")
    if len(admin_password) < 8:
        return

    users = load_users()
    if "admin" not in users:
        users["admin"] = {"hash": _hash_password(admin_password), "role": "admin"}
        save_users(users)


def register_user(username: str, password: str, role: str = "user") -> bool:
    username = _normalize_username(username)
    if not username or len(password) < 8:
        return False

    users = load_users()
    if username in users:
        return False
    users[username] = {"hash": _hash_password(password), "role": role}
    save_users(users)
    return True


def verify_user(username: str, password: str) -> bool:
    username = _normalize_username(username)
    users = load_users()
    if username not in users:
        return False
    stored = users[username]
    # Backward compatibility: stored may be a raw hash string
    if isinstance(stored, str):
        return _verify_password(password, stored)
    # New format
    return _verify_password(password, stored.get("hash", ""))


def get_user_role(username: str) -> str:
    username = _normalize_username(username)
    users = load_users()
    if username not in users:
        return "user"
    stored = users[username]
    if isinstance(stored, str):
        return "user"
    return stored.get("role", "user")


def list_users() -> dict:
    users = load_users()
    out = {}
    for k, v in users.items():
        if isinstance(v, str):
            out[k] = "user"
        else:
            out[k] = v.get("role", "user")
    return out


def delete_user(username: str) -> bool:
    username = _normalize_username(username)
    users = load_users()
    if username not in users:
        return False
    users.pop(username)
    save_users(users)
    return True


def set_user_role(username: str, role: str) -> bool:
    username = _normalize_username(username)
    users = load_users()
    if username not in users:
        return False

    stored = users[username]
    if isinstance(stored, str):
        users[username] = {"hash": stored, "role": role}
    else:
        stored["role"] = role
        users[username] = stored

    save_users(users)
    return True


def set_user_password(username: str, new_password: str) -> bool:
    username = _normalize_username(username)
    if not username or len(new_password) < 8:
        return False
    users = load_users()
    if username not in users:
        return False
    stored = users[username]
    # Replace stored hash while preserving role if present
    if isinstance(stored, str):
        users[username] = _hash_password(new_password)
    else:
        stored["hash"] = _hash_password(new_password)
        users[username] = stored
    save_users(users)
    return True
