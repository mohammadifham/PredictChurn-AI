export default function Error({ statusCode }) {
  return (
    <div style={{padding:40,textAlign:'center'}}>
      <h1>Something went wrong</h1>
      <p>{statusCode ? `Error ${statusCode}` : 'An unexpected error occurred.'}</p>
    </div>
  )
}
