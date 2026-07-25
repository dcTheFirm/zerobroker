import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Property } from '../types/property'
import './PropertyDetail.css'

export function PropertyDetail() {
  const { id } = useParams()
  const [property, setProperty] = useState<Property | null>(null)

  useEffect(() => {
    fetch(`http://localhost:4000/api/properties/${id}`)
      .then((res) => res.json())
      .then((payload) => setProperty(payload.data ?? null))
      .catch(() => setProperty(null))
  }, [id])

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

  const savingsEstimate =
    property.type === 'rent'
      ? property.price
      : Math.round(property.price * 0.02)

  return (
    <div className="property-detail">
      <div className="container">
        <Link to={property.type === 'rent' ? '/rent' : '/buy'} className="property-detail__back">
          ← Back to listings
        </Link>

        <div className="property-detail__gallery">
          <img
            src={property.image}
            alt={property.title}
            className="property-detail__image"
          />
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
                This {property.bedrooms} BHK {property.type === 'rent' ? 'rental' : 'property'}{' '}
                in {property.location}, {property.city} is listed directly by the owner
                on ZeroBroker. No agents, no brokerage — connect directly and save on
                every deal.
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
                <div className="property-detail__brokerage-text">
                  Zero Brokerage Property
                </div>
                <div className="property-detail__brokerage-savings">
                  Estimated savings: ₹{savingsEstimate.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="property-detail__actions">
              <button className="btn btn--primary">Contact Owner</button>
              <button className="btn btn--outline">Schedule Visit</button>
              <button className="btn btn--ghost">Save Property</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
