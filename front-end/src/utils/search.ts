import type { Property, SearchFilters } from '../types/property'

export const defaultFilters: SearchFilters = {
  query: '',
  city: '',
  type: 'all',
  minPrice: 0,
  maxPrice: 50000000,
  bedrooms: null,
}

export function filterProperties(
  properties: Property[],
  filters: SearchFilters,
): Property[] {
  return properties.filter((property) => {
    if (filters.type !== 'all' && property.type !== filters.type) {
      return false
    }

    if (filters.city && property.city !== filters.city) {
      return false
    }

    if (filters.bedrooms !== null && property.bedrooms < filters.bedrooms) {
      return false
    }

    if (property.price < filters.minPrice || property.price > filters.maxPrice) {
      return false
    }

    if (filters.query) {
      const q = filters.query.toLowerCase()
      const haystack = [
        property.title,
        property.location,
        property.city,
        property.area,
        ...property.tags,
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

export function getNearbyProperties(
  properties: Property[],
  city: string,
  limit = 4,
): Property[] {
  return properties.filter((p) => p.city === city).slice(0, limit)
}
