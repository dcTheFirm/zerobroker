import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchBar } from '../components/SearchBar'
import { PropertyCard } from '../components/PropertyCard'
import { defaultFilters } from '../utils/search'
import type { ListingType, Property, SearchFilters } from '../types/property'
import { listProperties, getAllProperties } from '../services/api'
import './ListingsPage.css'

interface ListingsPageProps {
  type: ListingType | 'all'
  title: string
  description: string
}

export function ListingsPage({ type, title, description }: ListingsPageProps) {
  const [searchParams] = useSearchParams()
  const [results, setResults] = useState<Property[]>([])

  const initialFilters: SearchFilters = useMemo(() => ({
    ...defaultFilters,
    type: searchParams.get('type') === 'buy' || searchParams.get('type') === 'rent' ? (searchParams.get('type') as ListingType) : type,
    query: searchParams.get('q') ?? searchParams.get('query') ?? '',
    city: searchParams.get('city') ?? '',
    bedrooms:
      searchParams.get('beds') != null
        ? Number(searchParams.get('beds'))
        : searchParams.get('bedrooms')
        ? Number(searchParams.get('bedrooms'))
        : null,
  }), [type, searchParams])

  const [filters, setFilters] = useState<SearchFilters>(initialFilters)

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    listProperties(filters)
      .then(async ({ data }) => {
        if (!mounted) return
        // If the backend returns very few results, try to augment with other properties
        if (data.length >= 3) {
          setResults(data)
          return
        }

        try {
          const all = await getAllProperties({ ...defaultFilters, type: 'all' })
          // merge unique properties until we have at least 3
          const ids = new Set(data.map((p) => p.id))
          const combined = [...data]
          for (const p of all) {
            if (combined.length >= 3) break
            if (!ids.has(p.id)) {
              combined.push(p)
              ids.add(p.id)
            }
          }
          setResults(combined)
        } catch {
          // fallback to the original list
          setResults(data)
        }
      })
      .catch(() => {
        setError('Unable to load listings right now. Please try again.')
        setResults([])
      })
      .finally(() => setLoading(false))

    return () => { mounted = false }
  }, [filters])

  const handleFilterChange = (updated: SearchFilters) => {
    setFilters({ ...updated, type: updated.type ?? type })
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
              Showing {type === 'rent' ? 'rental' : type === 'buy' ? 'sale' : 'rental and sale'} properties in{' '}
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
          {loading && <p className="listings-page__status">Loading properties…</p>}
          {error && <p className="listings-page__status listings-page__status--error">{error}</p>}
        </div>

        {loading ? (
          <div className="listings-page__empty">
            <div className="listings-page__empty-icon">⏳</div>
            <h3>Searching properties</h3>
            <p>Please wait while we update your results.</p>
          </div>
        ) : results.length > 0 ? (
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
