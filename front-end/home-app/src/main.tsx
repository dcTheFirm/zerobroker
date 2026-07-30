import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Header } from '../src/components/Header'
import { Footer } from '../src/components/Footer'
import { Home } from '../src/pages/Home'
import '../src/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <main>
        <Home />
      </main>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
)
