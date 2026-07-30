import { properties } from '../data/properties.js'
import type { Property, SearchFilters } from '../types/property.js'

const DEFAULT_LIMIT = 12

export function getRentProperties(filters: SearchFilters = {}) {
  const normalized = {
    query: filters.query?.trim() ?? '',
    city: filters.city?.trim() ?? '',
    minPrice: filters.minPrice ?? 0,
    maxPrice: filters.maxPrice ?? Number.MAX_SAFE_INTEGER,
    bedrooms: filters.bedrooms ?? null,
  }

  return properties.filter((property) => {
    if (property.type !== 'rent') return false
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

export function listRentProperties(filters: SearchFilters = {}, page = 1, limit = DEFAULT_LIMIT) {
  const all = getRentProperties(filters)
  const start = (page - 1) * limit
  return {
    data: all.slice(start, start + limit),
    total: all.length,
    page,
    limit,
  }
}

export function getRentPropertyById(id: string): Property | undefined {
  return properties.find((property) => property.id === id && property.type === 'rent')
}
