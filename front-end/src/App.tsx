import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { ListingsPage } from './pages/ListingsPage'
import { PropertyDetail } from './pages/PropertyDetail'
import { SignInPage } from './pages/SignInPage'
import { ListPropertyPage } from './pages/ListPropertyPage'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/rent"
            element={
              <ListingsPage
                type="rent"
                title="Rent a Home"
                description="Browse rental properties with zero brokerage. Connect directly with owners."
              />
            }
          />
          <Route
            path="/buy"
            element={
              <ListingsPage
                type="buy"
                title="Buy a Property"
                description="Find your dream home without paying agent commissions."
              />
            }
          />
          <Route
            path="/search"
            element={
              <ListingsPage
                type="all"
                title="Search Properties"
                description="Explore the best properties for rent and sale across cities."
              />
            }
          />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/list-property" element={<ListPropertyPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
