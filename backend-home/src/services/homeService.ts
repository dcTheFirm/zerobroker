import { getCollection } from '../db/mongo.js'
import { cities, properties } from '../data/properties.js'
import type { Property } from '../types/property.js'

type PropertyDocument = Property & { _id?: unknown }

async function getPropertiesCollection() {
  return getCollection<PropertyDocument>('properties')
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
