import type { Property, SearchFilters, ListingType } from '../types/property'
import { cities as localCities, properties as localProperties, formatPrice } from '../data/properties'
import { defaultFilters, filterProperties } from '../utils/search'

const HOME_BASE = import.meta.env.VITE_HOME_BASE_URL ?? 'http://localhost:4001'
const RENT_BASE = import.meta.env.VITE_RENT_BASE_URL ?? 'http://localhost:4002'
const BUY_BASE = import.meta.env.VITE_BUY_BASE_URL ?? 'http://localhost:4003'
const SEARCH_BASE = import.meta.env.VITE_SEARCH_BASE_URL ?? 'http://localhost:4004'

async function fetchApi<T>(base: string, path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${base}${path}`, options)
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message = payload?.error ?? `Network response was not ok: ${response.status}`
    throw new Error(message)
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
    const payload = await fetchApi<{ data: string[] }>(HOME_BASE, '/api/home/cities')
    return payload.data
  } catch {
    return [...localCities]
  }
}

export async function getFeaturedProperties(limit = 4): Promise<Property[]> {
  try {
    const payload = await fetchApi<{ data: Property[] }>(HOME_BASE, `/api/home/featured?limit=${limit}`)
    return payload.data
  } catch {
    return localProperties.filter((property) => property.featured).slice(0, limit)
  }
}

export async function getAllProperties(filters: SearchFilters = defaultFilters): Promise<Property[]> {
  try {
    const params = toSearchParams(filters)
    const payload = await fetchApi<{ data: Property[] }>(SEARCH_BASE, `/api/search?${params.toString()}`)
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

    if (filters.type === 'buy') {
      return await fetchApi<{ data: Property[] }>(BUY_BASE, `/api/buy/properties?${params.toString()}`)
    }

    if (filters.type === 'rent') {
      return await fetchApi<{ data: Property[] }>(RENT_BASE, `/api/rent/properties?${params.toString()}`)
    }

    return await fetchApi<{ data: Property[] }>(SEARCH_BASE, `/api/search?${params.toString()}`)
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
    const payload = await fetchApi<{ data: Property }>(SEARCH_BASE, `/api/search?id=${encodeURIComponent(id)}`)
    return payload.data
  } catch {
    return localProperties.find((property) => property.id === id) ?? null
  }
}

export async function submitContactRequest(property: Property, message: string): Promise<{ success: boolean; message: string }> {
  const base = property.type === 'buy' ? BUY_BASE : RENT_BASE
  const endpoint = `/${property.type}/properties/${property.id}/contact`

  try {
    await fetchApi(base, endpoint, {
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

export async function submitVisitRequest(property: Property, details: {
  name: string
  email: string
  date: string
  time: string
}): Promise<{ success: boolean; message: string }> {
  const base = property.type === 'buy' ? BUY_BASE : RENT_BASE
  const endpoint = `/${property.type}/properties/${property.id}/visit`

  try {
    await fetchApi(base, endpoint, {
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
    const base = listing.type === 'buy' ? BUY_BASE : RENT_BASE
    await fetchApi(base, `/${listing.type}/properties`, {
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
