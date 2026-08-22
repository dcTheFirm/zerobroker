import { Link } from 'react-router-dom'
import type { Property } from '../types/property'
import './PropertyCard.css'

interface PropertyCardProps { property: Property; featuredIndex?: number }

export function PropertyCard({ property, featuredIndex }: PropertyCardProps) {
  return <Link to={`/property/${property.id}`} className={`property-card ${featuredIndex === 0 ? 'property-card--lead' : ''}`}>
    <div className="property-card__image-wrap">
      <img src={property.image} alt={property.title} className="property-card__image" loading="lazy" />
      <div className="property-card__badges"><span className="badge badge--success">0% brokerage</span>{property.featured && <span className="badge badge--accent">Selected</span>}</div>
      <span className="property-card__type">{property.type === 'rent' ? 'Lease' : 'Purchase'}</span>
      <span className="property-card__open">Open <b>↗</b></span>
    </div>
    <div className="property-card__body"><div className="property-card__topline"><span className="property-card__price">{property.priceLabel}</span><span className="property-card__city">{property.city}</span></div><h3 className="property-card__title">{property.title}</h3><div className="property-card__location">{property.area}</div><div className="property-card__meta"><span>{property.bedrooms} BHK</span><span>{property.bathrooms} bath</span><span>{property.sqft} sq ft</span></div></div>
  </Link>
}
