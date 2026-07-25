import { properties, cities } from '../data/properties.js'
import type { Property, SearchFilters } from '../types/property.js'

export interface PropertyListResponse {
  data: Property[]
  total: number
  page: number
  limit: number
  cities: string[]
}

const DEFAULT_LIMIT = 12

export function getAllProperties(filters: SearchFilters = {}): Property[] {
  const normalizedFilters = {
    query: filters.query?.trim() ?? '',
    city: filters.city?.trim() ?? '',
    type: filters.type ?? 'all',
    minPrice: filters.minPrice ?? 0,
    maxPrice: filters.maxPrice ?? Number.MAX_SAFE_INTEGER,
    bedrooms: filters.bedrooms ?? null,
  }

  return properties.filter((property) => {
    if (normalizedFilters.type !== 'all' && property.type !== normalizedFilters.type) {
      return false
    }

    if (normalizedFilters.city && property.city !== normalizedFilters.city) {
      return false
    }

    if (normalizedFilters.bedrooms !== null && property.bedrooms < normalizedFilters.bedrooms) {
      return false
    }

    if (property.price < normalizedFilters.minPrice || property.price > normalizedFilters.maxPrice) {
      return false
    }

    if (normalizedFilters.query) {
      const q = normalizedFilters.query.toLowerCase()
      const haystack = [
        property.title,
        property.location,
        property.city,
        property.area,
        ...(property.tags ?? []),
      ]
        .join(' ')
        .toLowerCase()

      if (!haystack.includes(q)) {
        return false
      }
    }

    return true
  })
}

export function getFeaturedProperties(limit = 4): Property[] {
  return properties.filter((property) => property.featured).slice(0, limit)
}

export function getPropertyById(id: string): Property | undefined {
  return properties.find((property) => property.id === id)
}

export function listProperties(filters: SearchFilters = {}, page = 1, limit = DEFAULT_LIMIT): PropertyListResponse {
  const allProperties = getAllProperties(filters)
  const start = (page - 1) * limit
  const end = start + limit

  return {
    data: allProperties.slice(start, end),
    total: allProperties.length,
    page,
    limit,
    cities,
  }
}
