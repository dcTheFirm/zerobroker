import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Header } from '../src/components/Header'
import { Footer } from '../src/components/Footer'
import { ListingsPage } from '../src/pages/ListingsPage'
import '../src/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <main>
        <ListingsPage type="buy" title="Buy a Property" description="Find your dream home without paying agent commissions." />
      </main>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
)
