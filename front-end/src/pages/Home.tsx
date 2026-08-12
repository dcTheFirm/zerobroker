import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SearchBar } from '../components/SearchBar'
import { PropertyCard } from '../components/PropertyCard'
import { defaultFilters } from '../utils/search'
import type { Property } from '../types/property'
import { getAllProperties, getFeaturedProperties } from '../services/api'
import './Home.css'

const DEFAULT_CITY_IMAGE = 'https://images.unsplash.com/photo-1503264116251-35a269479413?w=600&q=80'

const cityImages: Record<string, string> = {
  Mumbai: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600&q=80',
  Bangalore: 'https://images.unsplash.com/photo-1596176530659-155891ed211c?w=600&q=80',
  'Delhi NCR': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80',
  Hyderabad: 'https://images.unsplash.com/photo-1617724664727-89a397de770a?w=600&q=80',
  Pune: 'https://images.unsplash.com/photo-1570168007204-d874b3945ade?w=600&q=80',
  Chennai: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&q=80',
  Kolkata: 'https://images.unsplash.com/photo-1558961363-fa8d64e7713f?w=600&q=80',
  Ahmedabad: 'https://images.unsplash.com/photo-1591608975360-fa7a2c169cb2?w=600&q=80',
}

export function Home() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [featured, setFeatured] = useState<Property[]>([])
  const [cityCounts, setCityCounts] = useState<Array<{ city: string; count: number }>>([])

  useEffect(() => {
    Promise.all([getFeaturedProperties(4), getAllProperties(defaultFilters)])
      .then(([featuredProperties, allProperties]) => {
        setFeatured(featuredProperties)
        const cities = Array.from(new Set(allProperties.map((property) => property.city)))
        setCityCounts(
          cities.map((city) => ({
            city,
            count: allProperties.filter((property) => property.city === city).length,
          }))
        )
      })
      .catch(() => {
        setFeatured([])
        setCityCounts([])
      })
  }, [])

  const handleSearch = () => {
    const path = filters.type === 'buy' ? '/buy' : filters.type === 'rent' ? '/rent' : '/search'
    const params = new URLSearchParams()
    if (filters.query) params.set('q', filters.query)
    if (filters.city) params.set('city', filters.city)
    if (filters.bedrooms) params.set('beds', String(filters.bedrooms))
    if (filters.type && filters.type !== 'all') params.set('type', filters.type)
    navigate(`${path}?${params.toString()}`)
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero__content">
            <div className="hero__badge">
              <span className="badge badge--success">✓ Zero Brokerage Guaranteed</span>
            </div>
            <h1 className="hero__title">
              Find your home, <em>broker-free</em>
            </h1>
            <p className="hero__subtitle">
              Rent or buy properties directly from owners. No middlemen, no hidden
              fees — save up to ₹2 lakhs on every transaction.
            </p>
            <div className="hero__stats">
              <div className="hero__stat">
                <div className="hero__stat-value">0%</div>
                <div className="hero__stat-label">Brokerage Fee</div>
              </div>
              <div className="hero__stat">
                <div className="hero__stat-value">8+</div>
                <div className="hero__stat-label">Cities Covered</div>
              </div>
              <div className="hero__stat">
                <div className="hero__stat-value">10K+</div>
                <div className="hero__stat-label">Verified Listings</div>
              </div>
            </div>
          </div>

          <SearchBar
            filters={filters}
            onChange={setFilters}
            onSearch={handleSearch}
          />
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why ZeroBroker?</h2>
          <p className="section-subtitle">
            A smarter way to find your next home — built for renters and buyers who
            want transparency.
          </p>
          <div className="features__grid">
            <div className="feature-card">
              <div className="feature-card__icon">💰</div>
              <h3 className="feature-card__title">Zero Brokerage</h3>
              <p className="feature-card__desc">
                Connect directly with property owners. No agent commissions, no
                surprise charges — ever.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">📍</div>
              <h3 className="feature-card__title">Location-Based Search</h3>
              <p className="feature-card__desc">
                Search by city, locality, or landmark. Find homes near your workplace,
                school, or metro.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-card__icon">🏠</div>
              <h3 className="feature-card__title">Rent & Buy</h3>
              <p className="feature-card__desc">
                Whether you&apos;re looking to rent a flat or buy your dream home,
                explore verified listings in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="listings-section">
        <div className="container">
          <div className="listings-section__header">
            <div>
              <h2 className="section-title">Featured Properties</h2>
              <p className="section-subtitle">Hand-picked homes with zero brokerage</p>
            </div>
            <Link to="/rent" className="btn btn--outline">
              View All →
            </Link>
          </div>
          <div className="listings-grid">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      <section className="cities-section">
        <div className="container">
          <h2 className="section-title">Explore by City</h2>
          <p className="section-subtitle">
            Browse rental and sale properties across India&apos;s top cities
          </p>
          <div className="cities-grid">
            {cityCounts.map(({ city, count }) => (
              <Link
                key={city}
                to={`/rent?city=${encodeURIComponent(city)}`}
                className="city-card"
              >
                <img
                  src={cityImages[city?.trim()] ?? DEFAULT_CITY_IMAGE}
                  alt={city}
                  className="city-card__image"
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_CITY_IMAGE }}
                />
                <div className="city-card__overlay">
                  <span className="city-card__name">{city}</span>
                  <span className="city-card__count">{count} properties</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2 className="cta-box__title">Own a property? List it free.</h2>
            <p className="cta-box__desc">
              Reach thousands of verified tenants and buyers without paying any
              brokerage or listing fees.
            </p>
            <Link to="/list-property" className="btn btn--primary">
            List Your Property
          </Link>
          </div>
        </div>
      </section>
    </>
  )
}
