import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Property } from '../types/property'
import {
  getPropertyById,
  isPropertySaved,
  toggleSavedProperty,
  submitContactRequest,
  submitVisitRequest,
} from '../services/api'
import './PropertyDetail.css'

export function PropertyDetail() {
  const { id } = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [contactMessage, setContactMessage] = useState('I am interested in this property. Please reach out with details.')
  const [visitName, setVisitName] = useState('')
  const [visitEmail, setVisitEmail] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [visitTime, setVisitTime] = useState('')

  useEffect(() => {
    setLoading(true)
    setMessage(null)

    getPropertyById(id)
      .then((result) => {
        setProperty(result)
        if (result) {
          setSaved(isPropertySaved(result.id))
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const backLink = useMemo(
    () => (property?.type === 'rent' ? '/rent' : '/buy'),
    [property],
  )

  const handleContact = async () => {
    if (!property) {
      return
    }
    const response = await submitContactRequest(property, contactMessage)
    setMessage(response.message)
  }

  const handleSchedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!property) {
      return
    }

    if (!visitName || !visitEmail || !visitDate || !visitTime) {
      setMessage('Please complete all scheduling details.')
      return
    }

    const response = await submitVisitRequest(property, {
      name: visitName,
      email: visitEmail,
      date: visitDate,
      time: visitTime,
    })
    setMessage(response.message)
  }

  const handleSave = () => {
    if (!property) {
      return
    }
    const savedState = toggleSavedProperty(property.id)
    setSaved(savedState)
    setMessage(savedState ? 'Property saved to your shortlist.' : 'Property removed from your shortlist.')
  }

  if (loading) {
    return (
      <div className="container property-detail__not-found">
        <h1>Loading property details…</h1>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container property-detail__not-found">
        <h1>Property not found</h1>
        <p style={{ marginTop: '1rem' }}>
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    )
  }

  const savingsEstimate = property.type === 'rent' ? property.price : Math.round(property.price * 0.02)

  return (
    <div className="property-detail">
      <div className="container">
        <Link to={backLink} className="property-detail__back">
          ← Back to listings
        </Link>

        <div className="property-detail__gallery">
          <img src={property.image} alt={property.title} className="property-detail__image" />
        </div>

        <div className="property-detail__layout">
          <div className="property-detail__main">
            <div className="property-detail__price">{property.priceLabel}</div>
            <h1 className="property-detail__title">{property.title}</h1>
            <div className="property-detail__location">
              <span>📍</span>
              {property.area}
            </div>

            <div className="property-detail__tags">
              <span className="badge badge--success">0% Brokerage</span>
              {property.tags.map((tag) => (
                <span key={tag} className="badge badge--primary">
                  {tag}
                </span>
              ))}
            </div>

            <div className="property-detail__specs">
              <div className="property-detail__spec">
                <div className="property-detail__spec-value">{property.bedrooms}</div>
                <div className="property-detail__spec-label">Bedrooms</div>
              </div>
              <div className="property-detail__spec">
                <div className="property-detail__spec-value">{property.bathrooms}</div>
                <div className="property-detail__spec-label">Bathrooms</div>
              </div>
              <div className="property-detail__spec">
                <div className="property-detail__spec-value">{property.sqft}</div>
                <div className="property-detail__spec-label">Sq. Ft.</div>
              </div>
            </div>

            <div className="property-detail__section">
              <h2>About this property</h2>
              <p>
                This {property.bedrooms} BHK {property.type === 'rent' ? 'rental' : 'property'} in{' '}
                {property.location}, {property.city} is listed directly by the owner on ZeroBroker.
                No agents, no brokerage — connect directly and save on every deal.
              </p>
            </div>

            <div className="property-detail__map">
              <div>📍 Location: {property.area}</div>
              <div className="property-detail__map-coords">
                {property.lat.toFixed(4)}, {property.lng.toFixed(4)}
              </div>
              <p style={{ marginTop: '0.75rem', fontSize: '0.8125rem' }}>
                Interactive map integration coming soon
              </p>
            </div>
          </div>

          <aside className="property-detail__sidebar">
            <div className="property-detail__brokerage">
              <span className="property-detail__brokerage-icon">✓</span>
              <div>
                <div className="property-detail__brokerage-text">Zero Brokerage Property</div>
                <div className="property-detail__brokerage-savings">
                  Estimated savings: ₹{savingsEstimate.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="property-detail__actions">
              <button className="btn btn--primary" type="button" onClick={handleContact}>
                Contact Owner
              </button>
              <button
                className="btn btn--outline"
                type="button"
                onClick={() => setMessage('Fill the form below to schedule your visit.')}
              >
                Schedule Visit
              </button>
              <button className="btn btn--ghost" type="button" onClick={handleSave}>
                {saved ? 'Saved ✓' : 'Save Property'}
              </button>
            </div>

            <div className="property-detail__message-input">
              <label>
                Message for owner
                <textarea
                  value={contactMessage}
                  onChange={(event) => setContactMessage(event.target.value)}
                  rows={4}
                  placeholder="Tell the owner why you are interested."
                />
              </label>
            </div>

            {message && <div className="property-detail__notice">{message}</div>}

            <form className="property-detail__schedule" onSubmit={handleSchedule}>
              <h3>Schedule a visit</h3>
              <label>
                Name
                <input
                  type="text"
                  value={visitName}
                  onChange={(event) => setVisitName(event.target.value)}
                  placeholder="Your name"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={visitEmail}
                  onChange={(event) => setVisitEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  value={visitDate}
                  onChange={(event) => setVisitDate(event.target.value)}
                />
              </label>
              <label>
                Time
                <input
                  type="time"
                  value={visitTime}
                  onChange={(event) => setVisitTime(event.target.value)}
                />
              </label>
              <button className="btn btn--primary" type="submit">
                Confirm visit
              </button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  )
}
