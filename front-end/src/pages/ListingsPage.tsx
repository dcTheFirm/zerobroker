import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchBar } from '../components/SearchBar'
import { PropertyCard } from '../components/PropertyCard'
import { defaultFilters } from '../utils/search'
import type { ListingType, Property, SearchFilters } from '../types/property'
import './ListingsPage.css'

interface ListingsPageProps {
  type: ListingType
  title: string
  description: string
}

export function ListingsPage({ type, title, description }: ListingsPageProps) {
  const [searchParams] = useSearchParams()
  const [results, setResults] = useState<Property[]>([])

  const initialFilters: SearchFilters = useMemo(() => ({
    ...defaultFilters,
    type,
    query: searchParams.get('q') ?? '',
    city: searchParams.get('city') ?? '',
    bedrooms: searchParams.get('beds') ? Number(searchParams.get('beds')) : null,
  }), [type, searchParams])

  const [filters, setFilters] = useState<SearchFilters>(initialFilters)

  useEffect(() => {
    const query = new URLSearchParams()
    if (filters.query) query.set('query', filters.query)
    if (filters.city) query.set('city', filters.city)
    if (filters.bedrooms) query.set('bedrooms', String(filters.bedrooms))
    if (filters.type && filters.type !== 'all') query.set('type', filters.type)

    fetch(`http://localhost:4000/api/properties?${query.toString()}`)
      .then((res) => res.json())
      .then((payload) => setResults(payload.data ?? []))
      .catch(() => setResults([]))
  }, [filters])

  const handleFilterChange = (updated: SearchFilters) => {
    setFilters({ ...updated, type })
  }

  return (
    <div className="listings-page">
      <div className="container">
        <div className="page-header">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        {filters.city && (
          <div className="location-banner">
            <span className="location-banner__icon">📍</span>
            <span>
              Showing {type === 'rent' ? 'rental' : 'sale'} properties in{' '}
              <strong>{filters.city}</strong> — zero brokerage on all listings
            </span>
          </div>
        )}

        <div className="listings-page__filters">
          <SearchBar
            filters={filters}
            onChange={handleFilterChange}
            compact
            defaultType={type}
          />
        </div>

        <div className="listings-page__toolbar">
          <p className="listings-page__count">
            <strong>{results.length}</strong> properties found
          </p>
        </div>

        {results.length > 0 ? (
          <div className="listings-grid">
            {results.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="listings-page__empty">
            <div className="listings-page__empty-icon">🔍</div>
            <h3>No properties found</h3>
            <p>Try adjusting your search filters or explore another city.</p>
          </div>
        )}
      </div>
    </div>
  )
}
