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
        <ListingsPage type="all" title="Search Properties" description="Explore properties across cities." />
      </main>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
)
