import crypto from 'node:crypto'
import type { Filter } from 'mongodb'
import { getCollection } from '../db/mongo.js'
import { properties } from '../data/properties.js'
import type { Property, SearchFilters } from '../types/property.js'

const DEFAULT_LIMIT = 12
type PropertyDocument = Property & { _id?: unknown }

export type ListingInput = {
  title: string
  type: 'rent'
  city: string
  area: string
  bedrooms: number
  bathrooms: number
  sqft: number
  price: number
  image: string
  tags?: string[]
}

function normalizeFilters(filters: SearchFilters = {}) {
  return {
    query: filters.query?.trim() ?? '',
    city: filters.city?.trim() ?? '',
    minPrice: filters.minPrice ?? 0,
    maxPrice: filters.maxPrice ?? Number.MAX_SAFE_INTEGER,
    bedrooms: filters.bedrooms ?? null,
  }
}

function matchesFilters(property: Property, filters: SearchFilters = {}) {
  const normalized = normalizeFilters(filters)

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
}

function buildMongoFilter(filters: SearchFilters = {}): Filter<PropertyDocument> {
  const normalized = normalizeFilters(filters)
  const mongoFilter: Filter<PropertyDocument> = { type: 'rent' }

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

function formatRentPrice(price: number) {
  return `₹${price.toLocaleString('en-IN')}/mo`
}

function toProperty(listing: ListingInput): Property {
  return {
    id: crypto.randomUUID(),
    title: listing.title,
    type: 'rent',
    location: listing.area.split(',')[0]?.trim() || listing.area,
    city: listing.city,
    area: listing.area,
    price: listing.price,
    priceLabel: formatRentPrice(listing.price),
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    sqft: listing.sqft,
    image: listing.image,
    featured: false,
    tags: listing.tags ?? [],
    lat: 0,
    lng: 0,
    description: 'Owner-submitted rental listing.',
    listedAt: new Date().toISOString().slice(0, 10),
    ownerVerified: false,
  }
}

export async function getRentProperties(filters: SearchFilters = {}): Promise<Property[]> {
  const collection = await getPropertiesCollection()

  if (collection) {
    return collection.find(buildMongoFilter(filters), { projection: { _id: 0 } }).toArray() as Promise<Property[]>
  }

  return properties.filter((property) => matchesFilters(property, filters))
}

export async function listRentProperties(filters: SearchFilters = {}, page = 1, limit = DEFAULT_LIMIT) {
  const collection = await getPropertiesCollection()
  const start = (page - 1) * limit

  if (collection) {
    const mongoFilter = buildMongoFilter(filters)
    const [data, total] = await Promise.all([
      collection.find(mongoFilter, { projection: { _id: 0 } }).skip(start).limit(limit).toArray() as Promise<Property[]>,
      collection.countDocuments(mongoFilter),
    ])

    return {
      data,
      total,
      page,
      limit,
    }
  }

  const all = properties.filter((property) => matchesFilters(property, filters))
  return {
    data: all.slice(start, start + limit),
    total: all.length,
    page,
    limit,
  }
}

export async function getRentPropertyById(id: string): Promise<Property | null> {
  const collection = await getPropertiesCollection()

  if (collection) {
    const property = await collection.findOne({ id, type: 'rent' }, { projection: { _id: 0 } })
    return property as Property | null
  }

  return properties.find((property) => property.id === id && property.type === 'rent') ?? null
}

export async function createRentProperty(listing: ListingInput): Promise<Property> {
  const property = toProperty(listing)
  const collection = await getPropertiesCollection()

  if (collection) {
    await collection.insertOne(property)
  } else {
    properties.push(property)
  }

  return property
}
