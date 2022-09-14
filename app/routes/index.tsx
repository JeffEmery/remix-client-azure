export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Welcome to Remix Beta 1</h1>
      <p>
        <a href="/about">About Route</a>
      </p>
      <p>
        <a href="/profile">Profile Route (protected)</a>
      </p>
      <div>
        <a href="/login">Login</a>
      </div>
    </div>
  )
}
