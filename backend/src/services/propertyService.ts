import type { Filter } from 'mongodb'
import { getCollection } from '../db/mongo.js'
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
  const normalizedFilters = normalizeFilters(filters)

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
}

function buildMongoFilter(filters: SearchFilters = {}): Filter<PropertyDocument> {
  const normalizedFilters = normalizeFilters(filters)
  const mongoFilter: Filter<PropertyDocument> = {}

  if (normalizedFilters.type !== 'all') {
    mongoFilter.type = normalizedFilters.type
  }

  if (normalizedFilters.city) {
    mongoFilter.city = normalizedFilters.city
  }

  if (normalizedFilters.bedrooms !== null) {
    mongoFilter.bedrooms = { $gte: normalizedFilters.bedrooms }
  }

  const priceFilter: Record<string, number> = {}
  if (normalizedFilters.minPrice > 0) {
    priceFilter.$gte = normalizedFilters.minPrice
  }
  if (normalizedFilters.maxPrice < Number.MAX_SAFE_INTEGER) {
    priceFilter.$lte = normalizedFilters.maxPrice
  }
  if (Object.keys(priceFilter).length > 0) {
    mongoFilter.price = priceFilter
  }

  if (normalizedFilters.query) {
    const queryRegex = new RegExp(normalizedFilters.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
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

export async function getAllProperties(filters: SearchFilters = {}): Promise<Property[]> {
  const collection = await getPropertiesCollection()

  if (collection) {
    return collection.find(buildMongoFilter(filters), { projection: { _id: 0 } }).toArray() as Promise<Property[]>
  }

  return properties.filter((property) => matchesFilters(property, filters))
}

export async function getFeaturedProperties(limit = 4): Promise<Property[]> {
  const collection = await getPropertiesCollection()

  if (collection) {
    return collection.find({ featured: true }, { projection: { _id: 0 } }).limit(limit).toArray() as Promise<Property[]>
  }

  return properties.filter((property) => property.featured).slice(0, limit)
}

export async function getCities(): Promise<string[]> {
  const collection = await getPropertiesCollection()

  if (collection) {
    const mongoCities = (await collection.distinct('city')).filter((city): city is string => typeof city === 'string')
    return mongoCities.sort((a, b) => a.localeCompare(b))
  }

  return cities
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const collection = await getPropertiesCollection()

  if (collection) {
    const property = await collection.findOne({ id }, { projection: { _id: 0 } })
    return property as Property | null
  }

  return properties.find((property) => property.id === id) ?? null
}

export async function listProperties(filters: SearchFilters = {}, page = 1, limit = DEFAULT_LIMIT): Promise<PropertyListResponse> {
  const collection = await getPropertiesCollection()
  const start = (page - 1) * limit

  if (collection) {
    const mongoFilter = buildMongoFilter(filters)
    const [data, total, cityList] = await Promise.all([
      collection.find(mongoFilter, { projection: { _id: 0 } }).skip(start).limit(limit).toArray() as Promise<Property[]>,
      collection.countDocuments(mongoFilter),
      collection.distinct('city'),
    ])
    const citiesFromMongo = cityList.filter((city): city is string => typeof city === 'string')

    return {
      data,
      total,
      page,
      limit,
      cities: citiesFromMongo.sort((a, b) => a.localeCompare(b)),
    }
  }

  const allProperties = properties.filter((property) => matchesFilters(property, filters))

  return {
    data: allProperties.slice(start, start + limit),
    total: allProperties.length,
    page,
    limit,
    cities,
  }
}
