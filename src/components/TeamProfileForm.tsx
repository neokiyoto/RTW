import { useState } from 'react'
import { isValidProfile, PROFILE_NAME_LIMIT, type TeamProfile } from '../utils/teamProfile'

export function TeamProfileForm({ initial, onSave, onCancel, submitLabel }: {
  initial: TeamProfile
  onSave: (profile: TeamProfile) => void
  onCancel: () => void
  submitLabel: string
}) {
  const [teamName, setTeamName] = useState(initial.teamName)
  const [managerName, setManagerName] = useState(initial.managerName)
  const [error, setError] = useState('')
  return <form className="profile-form" onSubmit={(event) => {
    event.preventDefault()
    const profile = { teamName: teamName.trim(), managerName: managerName.trim() }
    if (!isValidProfile(profile)) { setError('Enter both names using 1–32 visible characters.'); return }
    onSave(profile)
  }}>
    <label>Team name<input autoFocus value={teamName} onChange={(event) => setTeamName(event.target.value)} maxLength={PROFILE_NAME_LIMIT} required autoComplete="off" placeholder="Your team name" /></label>
    <label>Manager name<input value={managerName} onChange={(event) => setManagerName(event.target.value)} maxLength={PROFILE_NAME_LIMIT} required autoComplete="off" placeholder="Your name or handle" /></label>
    <p className="field-hint">Up to 32 characters each. You can change these later on the roster page.</p>
    {error && <p role="alert">{error}</p>}
    <div className="hero-actions"><button className="primary-button" type="submit">{submitLabel}</button><button className="secondary-button" type="button" onClick={onCancel}>Cancel</button></div>
  </form>
}
