import { properties } from '../data/properties.js'
import type { Property, SearchFilters } from '../types/property.js'

export function findProperties(filters: SearchFilters = {}): Property[] {
  const normalized = {
    query: filters.query?.trim() ?? '',
    city: filters.city?.trim() ?? '',
    type: filters.type ?? 'all',
    minPrice: filters.minPrice ?? 0,
    maxPrice: filters.maxPrice ?? Number.MAX_SAFE_INTEGER,
    bedrooms: filters.bedrooms ?? null,
  }

  return properties.filter((property) => {
    if (normalized.type !== 'all' && property.type !== normalized.type) return false
    if (normalized.city && property.city !== normalized.city) return false
    if (normalized.bedrooms !== null && property.bedrooms < normalized.bedrooms) return false
    if (property.price < normalized.minPrice || property.price > normalized.maxPrice) return false

    if (normalized.query) {
      const searchTarget = [property.title, property.location, property.city, property.area, ...property.tags].join(' ').toLowerCase()
      if (!searchTarget.includes(normalized.query.toLowerCase())) {
        return false
      }
    }

    return true
  })
}

export function getPropertyById(id: string): Property | undefined {
  return properties.find((property) => property.id === id)
}
