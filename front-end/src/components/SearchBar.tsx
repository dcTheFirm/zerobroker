import { useEffect, useState, type FormEvent } from 'react'
import type { ListingType, SearchFilters } from '../types/property'
import { getCities } from '../services/api'
import './SearchBar.css'

const keywordSuggestions = [
  'Zero Brokerage',
  'Furnished',
  'Near Metro',
  'Sea View',
  'Gym Access',
]

interface SearchBarProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
  onSearch?: () => void
  compact?: boolean
  defaultType?: ListingType | 'all'
}

export function SearchBar({
  filters,
  onChange,
  onSearch,
  compact = false,
  defaultType = 'all',
}: SearchBarProps) {
  const [cities, setCities] = useState<string[]>([])

  useEffect(() => {
    getCities().then(setCities).catch(() => setCities([]))
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch?.()
  }

  const setType = (type: ListingType | 'all') => {
    onChange({ ...filters, type })
  }

  return (
    <form
      className={`search-bar ${compact ? 'search-bar--compact' : ''}`}
      onSubmit={handleSubmit}
    >
      {!compact && (
        <div className="search-bar__tabs">
          <button
            type="button"
            className={`search-bar__tab ${filters.type === 'all' || filters.type === defaultType ? 'search-bar__tab--active' : ''}`}
            onClick={() => setType('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`search-bar__tab ${filters.type === 'rent' ? 'search-bar__tab--active' : ''}`}
            onClick={() => setType('rent')}
          >
            Rent
          </button>
          <button
            type="button"
            className={`search-bar__tab ${filters.type === 'buy' ? 'search-bar__tab--active' : ''}`}
            onClick={() => setType('buy')}
          >
            Buy
          </button>
        </div>
      )}

      <div className="search-bar__fields">
        <div className="search-bar__field">
          <label className="search-bar__label" htmlFor="search-query">
            Search keywords
          </label>
          <input
            id="search-query"
            className="search-bar__input"
            type="text"
            list="search-keywords"
            placeholder="Search by locality, city, tag or keyword..."
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
          />
          <datalist id="search-keywords">
            {keywordSuggestions.map((keyword) => (
              <option key={keyword} value={keyword} />
            ))}
            {cities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>

        <div className="search-bar__field">
          <label className="search-bar__label" htmlFor="search-city">
            City
          </label>
          <select
            id="search-city"
            className="search-bar__select"
            value={filters.city}
            onChange={(e) => onChange({ ...filters, city: e.target.value })}
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="search-bar__field">
          <label className="search-bar__label" htmlFor="search-beds">
            Bedrooms
          </label>
          <select
            id="search-beds"
            className="search-bar__select"
            value={filters.bedrooms ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                bedrooms: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">Any</option>
            <option value="1">1+ BHK</option>
            <option value="2">2+ BHK</option>
            <option value="3">3+ BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>

        <button type="submit" className="btn btn--primary search-bar__submit">
          Search
        </button>
      </div>
    </form>
  )
}
