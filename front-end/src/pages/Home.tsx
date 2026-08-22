import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SearchBar } from '../components/SearchBar'
import { defaultFilters } from '../utils/search'
import type { Property } from '../types/property'
import { getAllProperties, getFeaturedProperties } from '../services/api'
import './Home.css'

// Real, verified photos per city (Wikimedia Commons, stable Special:FilePath links).
// Keyed by lowercased, trimmed city name so free-text city values entered on
// property listings (any casing/spacing) still resolve to the right photo.
const cityImages: Record<string, string> = {
  mumbai: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=900&q=85',
  bangalore: 'https://commons.wikimedia.org/wiki/Special:FilePath/UB%20City%20Skyline.jpg?width=900',
  bengaluru: 'https://commons.wikimedia.org/wiki/Special:FilePath/UB%20City%20Skyline.jpg?width=900',
  'delhi ncr': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&q=85',
  delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&q=85',
  'new delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&q=85',
  hyderabad: 'https://commons.wikimedia.org/wiki/Special:FilePath/Charminar%20Hyderabad%201.jpg?width=900',
  pune: 'https://commons.wikimedia.org/wiki/Special:FilePath/Shaniwar%20Wada%2C%20Pune.jpg?width=900',
  chennai: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=900&q=85',
  kolkata: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=900&q=85',
  ahmedabad: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sabarmati%20Riverfront%20in%20Ahmedabad.jpg?width=900',
  jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=900&q=85',
  gurgaon: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&q=85',
  gurugram: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&q=85',
  noida: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&q=85',
}

// If a city has no curated photo (or its photo ever 404s), fall back to a
// photo that's unique to THAT city rather than one shared generic image —
// this is what was causing every unmapped city to show the same picture.
function getCityImage(city: string) {
  const key = city.trim().toLowerCase()
  return cityImages[key] ?? `https://picsum.photos/seed/${encodeURIComponent(key || 'city')}/900/600`
}

function getCityImageFallback(city: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(city.trim().toLowerCase() || 'city')}/900/600`
}

export function Home() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [featured, setFeatured] = useState<Property[]>([])
  const [cityCounts, setCityCounts] = useState<Array<{ city: string; count: number }>>([])

  useEffect(() => {
    Promise.all([getFeaturedProperties(4), getAllProperties(defaultFilters)]).then(([homes, all]) => {
      setFeatured(homes)
      const cities = Array.from(new Set(all.map(({ city }) => city)))
      setCityCounts(cities.map((city) => ({ city, count: all.filter((home) => home.city === city).length })))
    }).catch(() => { setFeatured([]); setCityCounts([]) })
  }, [])

  const handleSearch = () => {
    const path = filters.type === 'buy' ? '/buy' : filters.type === 'rent' ? '/rent' : '/search'
    const params = new URLSearchParams()
    if (filters.query) params.set('q', filters.query)
    if (filters.city) params.set('city', filters.city)
    if (filters.bedrooms) params.set('beds', String(filters.bedrooms))
    if (filters.type !== 'all') params.set('type', filters.type)
    navigate(`${path}?${params.toString()}`)
  }

  return <div className="page-shell">
    <section className="hero">
      <div className="hero__orb hero__orb--one" aria-hidden="true" />
      <div className="hero__orb hero__orb--two" aria-hidden="true" />
      <div className="hero__grid" aria-hidden="true" />
      <div className="container hero__container">
        <div className="hero__content reveal is-revealed">
          <span className="eyebrow hero__eyebrow">India, unbrokered</span>
          <div className="hero__badge"><span className="badge badge--success">0% brokerage, always</span></div>
          <h1 className="hero__title">Find a place<br />that feels like <em>yours.</em></h1>
          <p className="hero__subtitle">A more direct route to your next home. Meet owners, not middlemen.</p>
          <div className="hero__stats">
            <div className="hero__stat"><div className="hero__stat-value">0<small>%</small></div><div className="hero__stat-label">Brokerage, forever</div></div>
            <div className="hero__stat"><div className="hero__stat-value">8<small>+</small></div><div className="hero__stat-label">Cities to explore</div></div>
            <div className="hero__stat"><div className="hero__stat-value">∞</div><div className="hero__stat-label">Less friction</div></div>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true" data-parallax="0.055">
          <div className="hero__frame hero__frame--back" />
          <div className="hero__image-card"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1300&q=85" alt="" /><span className="hero__image-note">A home should not cost you a commission.</span></div>
          <div className="hero__marker">01<span>direct</span></div>
        </div>
        <div className="hero__search-wrap"><span className="hero__search-label">Start with a feeling. Refine with filters.</span><SearchBar filters={filters} onChange={setFilters} onSearch={handleSearch} /></div>
      </div>
    </section>

    <div className="home-marquee marquee" aria-hidden="true"><div className="marquee__track"><span>DIRECT TO OWNER <b>✦</b></span><span>ZERO BROKERAGE <b>✦</b></span><span>HOMES WITH ROOM TO BREATHE <b>✦</b></span><span>DIRECT TO OWNER <b>✦</b></span><span>ZERO BROKERAGE <b>✦</b></span><span>HOMES WITH ROOM TO BREATHE <b>✦</b></span></div></div>

    {featured.length > 0 && <section className="property-peek">
      <div className="container">
        <div className="property-peek__intro reveal"><span className="eyebrow">A first look</span><h2 className="section-title">Homes with a<br /><em>point of view.</em></h2><p className="section-subtitle">A moving edit of the places currently waiting for their next chapter.</p></div>
        <div className="property-peek__rail">
          {featured.slice(0, 3).map((property, index) => <Link key={property.id} to={`/property/${property.id}`} className={`peek-card peek-card--${index + 1} reveal`}>
            <div className="peek-card__image" data-parallax={index === 1 ? '0.09' : '0.055'}><img src={property.image} alt={property.title} loading="lazy" /></div>
            <div className="peek-card__caption"><span>0{index + 1} / {property.type}</span><strong>{property.title}</strong><small>{property.priceLabel} · {property.city} <b>↗</b></small></div>
          </Link>)}
        </div>
        <div className="property-peek__footer reveal"><span>Scroll to discover more</span><Link to="/search" className="btn btn--primary">Browse the collection <span aria-hidden="true">↗</span></Link></div>
      </div>
    </section>}

    <section className="features"><div className="container reveal">
      <span className="eyebrow">The better way home</span><h2 className="section-title">No detours.<br /><em>Just doors opening.</em></h2>
      <div className="features__grid">
        <article className="feature-card reveal"><div className="feature-card__number">01</div><h3 className="feature-card__title">Every rupee stays yours.</h3><p className="feature-card__desc">Connect directly with owners. No commission negotiations. No surprise charges.</p></article>
        <article className="feature-card reveal"><div className="feature-card__number">02</div><h3 className="feature-card__title">Search around your life.</h3><p className="feature-card__desc">Look by city, locality or landmark and live closer to what matters.</p></article>
        <article className="feature-card reveal"><div className="feature-card__number">03</div><h3 className="feature-card__title">Your next move, uncluttered.</h3><p className="feature-card__desc">One calm place to explore rental and sale homes, on your terms.</p></article>
      </div>
    </div></section>

    <section className="cities-section"><div className="container reveal">
      <span className="eyebrow">A city, differently</span><h2 className="section-title">Start where<br /><em>you are.</em></h2><p className="section-subtitle">The familiar, then the unexpectedly perfect.</p>
      <div className="cities-grid">{cityCounts.map(({ city, count }, index) => <Link key={city} to={`/rent?city=${encodeURIComponent(city)}`} className="city-card"><img src={getCityImage(city)} alt={city} className="city-card__image" loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = getCityImageFallback(city) }} /><div className="city-card__overlay"><span className="city-card__index">0{index + 1}</span><span className="city-card__name">{city}</span><span className="city-card__count">{count} homes to browse <b>↗</b></span></div></Link>)}</div>
    </div></section>

    <section className="cta-section"><div className="container reveal"><div className="cta-box"><span className="eyebrow">A direct introduction</span><h2 className="cta-box__title">Put your home<br /><em>on the map.</em></h2><p className="cta-box__desc">Meet people who are already looking for a place like yours, without an extra layer in between.</p><Link to="/list-property" className="btn btn--primary">List your property <span aria-hidden="true">↗</span></Link></div></div></section>
  </div>
}
