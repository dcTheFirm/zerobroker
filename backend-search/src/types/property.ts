export type ListingType = 'rent' | 'buy'

export interface Property {
  id: string
  title: string
  type: ListingType
  location: string
  city: string
  area: string
  price: number
  priceLabel: string
  bedrooms: number
  bathrooms: number
  sqft: number
  image: string
  featured: boolean
  tags: string[]
  lat: number
  lng: number
  description?: string
  listedAt?: string
  ownerName?: string
  ownerVerified?: boolean
}

export interface SearchFilters {
  query?: string
  city?: string
  type?: ListingType | 'all'
  minPrice?: number
  maxPrice?: number
  bedrooms?: number | null
}
