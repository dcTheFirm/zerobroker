import type { Filter } from 'mongodb'
import { getCollection } from '../db/mongo.js'
import { properties } from '../data/properties.js'
import type { Property, SearchFilters } from '../types/property.js'

type PropertyDocument = Property & { _id?: unknown }

function normalizeFilters(filters: SearchFilters = {}) {
  return {
    query: filters.query?.trim() ?? '',
    city: filters.city?.trim() ?? '',
    type: filters.type ?? 'all',
    minPrice: filters.minPrice ?? 0,
    maxPrice: filters.maxPrice ?? Number.MAX_SAFE_INTEGER,
    bedrooms: filters.bedrooms ?? null,
  }
}

function matchesFilters(property: Property, filters: SearchFilters = {}) {
  const normalized = normalizeFilters(filters)

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
}

function buildMongoFilter(filters: SearchFilters = {}): Filter<PropertyDocument> {
  const normalized = normalizeFilters(filters)
  const mongoFilter: Filter<PropertyDocument> = {}

  if (normalized.type !== 'all') {
    mongoFilter.type = normalized.type
  }

  if (normalized.city) {
    mongoFilter.city = normalized.city
  }

  if (normalized.bedrooms !== null) {
    mongoFilter.bedrooms = { $gte: normalized.bedrooms }
  }

  const priceFilter: Record<string, number> = {}
  if (normalized.minPrice > 0) {
    priceFilter.$gte = normalized.minPrice
  }
  if (normalized.maxPrice < Number.MAX_SAFE_INTEGER) {
    priceFilter.$lte = normalized.maxPrice
  }
  if (Object.keys(priceFilter).length > 0) {
    mongoFilter.price = priceFilter
  }

  if (normalized.query) {
    const queryRegex = new RegExp(normalized.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    mongoFilter.$or = [
      { title: queryRegex },
      { location: queryRegex },
      { city: queryRegex },
      { area: queryRegex },
      { tags: queryRegex },
    ]
  }

  return mongoFilter
}

async function getPropertiesCollection() {
  return getCollection<PropertyDocument>('properties')
}

export async function findProperties(filters: SearchFilters = {}): Promise<Property[]> {
  const collection = await getPropertiesCollection()

  if (collection) {
    return collection.find(buildMongoFilter(filters), { projection: { _id: 0 } }).toArray() as Promise<Property[]>
  }

  return properties.filter((property) => matchesFilters(property, filters))
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const collection = await getPropertiesCollection()

  if (collection) {
    const property = await collection.findOne({ id }, { projection: { _id: 0 } })
    return property as Property | null
  }

  return properties.find((property) => property.id === id) ?? null
}
