export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Profile Route</h1>
      <p>This route is protected</p>
      <div>
        <a href="/identity">Show auth profile</a>
      </div>
      <div>
        <a href="/purge">Remove auth profile</a>
      </div>
      <div>
        <a href="/logout">Logout</a>
      </div>
      <p>
        <a href="/">Index Route</a>
      </p>
    </div>
  )
}
