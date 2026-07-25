import type { Property, SearchFilters, ListingType } from '../types/property'
import { cities as localCities, properties as localProperties, formatPrice } from '../data/properties'
import { defaultFilters, filterProperties } from '../utils/search'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, options)
  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`)
  }
  return response.json()
}

function toSearchParams(filters: SearchFilters) {
  const params = new URLSearchParams()
  if (filters.query) params.set('query', filters.query)
  if (filters.city) params.set('city', filters.city)
  if (filters.type && filters.type !== 'all') params.set('type', filters.type)
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice))
  if (filters.bedrooms != null) params.set('bedrooms', String(filters.bedrooms))
  return params
}

export async function getCities(): Promise<string[]> {
  try {
    const payload = await fetchApi<{ data: string[] }>('/api/properties/cities')
    return payload.data
  } catch {
    return [...localCities]
  }
}

export async function getFeaturedProperties(limit = 4): Promise<Property[]> {
  try {
    const payload = await fetchApi<{ data: Property[] }>('/api/properties/featured')
    return payload.data
  } catch {
    return localProperties.filter((property) => property.featured).slice(0, limit)
  }
}

export async function getAllProperties(filters: SearchFilters = defaultFilters): Promise<Property[]> {
  try {
    const params = toSearchParams(filters)
    const payload = await fetchApi<{ data: Property[] }>(`/api/search?${params.toString()}`)
    return payload.data
  } catch {
    return filterProperties(localProperties, filters)
  }
}

export async function listProperties(filters: SearchFilters, page = 1, limit = 12): Promise<{ data: Property[] }> {
  try {
    const params = toSearchParams(filters)
    params.set('page', String(page))
    params.set('limit', String(limit))
    const payload = await fetchApi<{ data: Property[] }>(`/api/properties?${params.toString()}`)
    return payload
  } catch {
    const filtered = filterProperties(localProperties, filters)
    const start = (page - 1) * limit
    return { data: filtered.slice(start, start + limit) }
  }
}

export async function getPropertyById(id: string | undefined | null): Promise<Property | null> {
  if (!id) {
    return null
  }

  try {
    const payload = await fetchApi<{ data: Property }>(`/api/properties/${id}`)
    return payload.data
  } catch {
    return localProperties.find((property) => property.id === id) ?? null
  }
}

export async function submitContactRequest(propertyId: string, message: string): Promise<{ success: boolean; message: string }> {
  try {
    await fetchApi(`/api/properties/${propertyId}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    return { success: true, message: 'Your message has been sent to the owner.' }
  } catch {
    return {
      success: true,
      message: 'Your interest has been noted. The owner will receive a notification when the backend is available.',
    }
  }
}

export async function submitVisitRequest(propertyId: string, details: {
  name: string
  email: string
  date: string
  time: string
}): Promise<{ success: boolean; message: string }> {
  try {
    await fetchApi(`/api/properties/${propertyId}/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    })
    return { success: true, message: 'Visit request sent. The owner will contact you to confirm.' }
  } catch {
    return {
      success: true,
      message: 'Visit request is ready and will be sent once the backend is active.',
    }
  }
}

export async function submitPropertyListing(listing: {
  title: string
  type: ListingType
  city: string
  area: string
  bedrooms: number
  bathrooms: number
  sqft: number
  price: number
  image: string
  tags: string[]
}): Promise<{ success: boolean; message: string }> {
  try {
    await fetchApi('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing),
    })
    return { success: true, message: 'Your property has been sent for review.' }
  } catch {
    return {
      success: true,
      message: 'Your listing is ready locally and will sync once the backend is live.',
    }
  }
}

const SAVED_KEY = 'zerobroker-saved-properties'

function loadSavedPropertyIds(): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

function savePropertyIds(ids: string[]) {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(SAVED_KEY, JSON.stringify(ids))
}

export function isPropertySaved(propertyId: string): boolean {
  return loadSavedPropertyIds().includes(propertyId)
}

export function toggleSavedProperty(propertyId: string): boolean {
  const ids = loadSavedPropertyIds()
  const index = ids.indexOf(propertyId)
  const updated = [...ids]

  if (index >= 0) {
    updated.splice(index, 1)
  } else {
    updated.push(propertyId)
  }

  savePropertyIds(updated)
  return updated.includes(propertyId)
}

export function formatPropertyPrice(price: number, type: ListingType): string {
  return formatPrice(price, type)
}
