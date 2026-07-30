import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { submitPropertyListing } from '../services/api'
import { getCurrentUser } from '../services/auth'
import './ListPropertyPage.css'

export function ListPropertyPage() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'rent' | 'buy'>('rent')
  const [city, setCity] = useState('')
  const [area, setArea] = useState('')
  const [bedrooms, setBedrooms] = useState(2)
  const [bathrooms, setBathrooms] = useState(2)
  const [sqft, setSqft] = useState(1000)
  const [price, setPrice] = useState(25000)
  const [image, setImage] = useState('')
  const [tags, setTags] = useState('Zero Brokerage, Verified')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setStatus(null)

    if (!title.trim() || !city.trim() || !area.trim() || !image.trim()) {
      setError('Fill in all required fields before submitting.')
      return
    }

    const result = await submitPropertyListing({
      title: title.trim(),
      type,
      city: city.trim(),
      area: area.trim(),
      bedrooms,
      bathrooms,
      sqft,
      price,
      image: image.trim(),
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    })

    setStatus(result.message)
    setTimeout(() => navigate('/'), 1500)
  }

  return (
    <div className="list-property-page">
      <div className="container list-property-page__card">
        <div className="list-property-page__top">
          <h1>List Your Property</h1>
          <p>
            Submit a new listing directly from the frontend. Your request will be
            prepared for backend fulfillment as soon as the API is available.
          </p>
          {currentUser ? (
            <p className="list-property-page__user">
              Signed in as <strong>{currentUser.email}</strong>
            </p>
          ) : (
            <p className="list-property-page__alert">
              Please sign in or sign up to publish a listing. You can still use the app locally while the auth service is offline.
            </p>
          )}
        </div>

        <form className="property-form" onSubmit={handleSubmit}>
          <label className="property-form__label" htmlFor="property-title">
            Property title
          </label>
          <input
            id="property-title"
            className="property-form__input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Modern 2BHK near the metro"
          />

          <div className="property-form__row">
            <div>
              <label className="property-form__label" htmlFor="property-type">
                Type
              </label>
              <select
                id="property-type"
                className="property-form__select"
                value={type}
                onChange={(event) => setType(event.target.value as 'rent' | 'buy')}
              >
                <option value="rent">Rent</option>
                <option value="buy">Buy</option>
              </select>
            </div>
            <div>
              <label className="property-form__label" htmlFor="property-city">
                City
              </label>
              <input
                id="property-city"
                className="property-form__input"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Mumbai"
              />
            </div>
          </div>

          <label className="property-form__label" htmlFor="property-area">
            Locality / area
          </label>
          <input
            id="property-area"
            className="property-form__input"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            placeholder="Bandra West, Mumbai"
          />

          <div className="property-form__row">
            <div>
              <label className="property-form__label" htmlFor="property-bedrooms">
                Bedrooms
              </label>
              <input
                id="property-bedrooms"
                className="property-form__input"
                type="number"
                min={1}
                value={bedrooms}
                onChange={(event) => setBedrooms(Number(event.target.value))}
              />
            </div>
            <div>
              <label className="property-form__label" htmlFor="property-bathrooms">
                Bathrooms
              </label>
              <input
                id="property-bathrooms"
                className="property-form__input"
                type="number"
                min={1}
                value={bathrooms}
                onChange={(event) => setBathrooms(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="property-form__row">
            <div>
              <label className="property-form__label" htmlFor="property-sqft">
                Area (sqft)
              </label>
              <input
                id="property-sqft"
                className="property-form__input"
                type="number"
                min={200}
                value={sqft}
                onChange={(event) => setSqft(Number(event.target.value))}
              />
            </div>
            <div>
              <label className="property-form__label" htmlFor="property-price">
                Price
              </label>
              <input
                id="property-price"
                className="property-form__input"
                type="number"
                min={1}
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
              />
            </div>
          </div>

          <label className="property-form__label" htmlFor="property-image">
            Image URL
          </label>
          <input
            id="property-image"
            className="property-form__input"
            value={image}
            onChange={(event) => setImage(event.target.value)}
            placeholder="https://example.com/image.jpg"
          />

          <label className="property-form__label" htmlFor="property-tags">
            Tags (comma separated)
          </label>
          <input
            id="property-tags"
            className="property-form__input"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Zero Brokerage, Furnished, Near Metro"
          />

          {(error || status) && (
            <div className={`property-form__message ${error ? 'property-form__message--error' : 'property-form__message--success'}`}>
              {error ?? status}
            </div>
          )}

          <div className="list-property-page__actions">
            <button type="button" className="btn btn--outline" onClick={() => navigate(-1)}>
              Back
            </button>
            <button type="submit" className="btn btn--primary">
              Submit Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
