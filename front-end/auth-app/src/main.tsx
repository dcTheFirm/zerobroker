import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Header } from '../src/components/Header'
import { Footer } from '../src/components/Footer'
import { SignInPage } from '../src/pages/SignInPage'
import '../src/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Header />
      <main>
        <SignInPage />
      </main>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
)
