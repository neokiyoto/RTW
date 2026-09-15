import { Link } from 'react-router-dom'
import '../styles/not-found.css'

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <p className="eyebrow">404 — Page not found</p>
      <h1>This route is not part of the Phase 1 foundation.</h1>
      <p>The game routes will be added one manageable phase at a time.</p>
      <Link className="text-link" to="/">
        Return to the home page
      </Link>
    </main>
  )
}
