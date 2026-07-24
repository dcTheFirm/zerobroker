import { Link } from 'react-router-dom'
import type { Property } from '../types/property'
import './PropertyCard.css'

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link to={`/property/${property.id}`} className="property-card">
      <div className="property-card__image-wrap">
        <img
          src={property.image}
          alt={property.title}
          className="property-card__image"
          loading="lazy"
        />
        <div className="property-card__badges">
          <span className="badge badge--success">0% Brokerage</span>
          {property.featured && (
            <span className="badge badge--accent">Featured</span>
          )}
        </div>
        <span className="property-card__type">
          {property.type === 'rent' ? 'For Rent' : 'For Sale'}
        </span>
      </div>
      <div className="property-card__body">
        <div className="property-card__price">{property.priceLabel}</div>
        <h3 className="property-card__title">{property.title}</h3>
        <div className="property-card__location">
          <span>📍</span>
          {property.area}
        </div>
        <div className="property-card__meta">
          <span>🛏 {property.bedrooms} BHK</span>
          <span>🚿 {property.bathrooms} Bath</span>
          <span>📐 {property.sqft} sqft</span>
        </div>
      </div>
    </Link>
  )
}
