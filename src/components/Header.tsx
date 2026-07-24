import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Header.css'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <img src="/favicon.svg" alt="" className="logo__icon" />
          ZeroBroker
          <span className="logo__tag">0% Fee</span>
        </Link>

        <button
          className="menu-toggle"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        <nav className={`nav ${menuOpen ? 'nav--open' : ''}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav__link ${isActive ? 'nav__link--active' : ''}`
            }
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/rent"
            className={({ isActive }) =>
              `nav__link ${isActive ? 'nav__link--active' : ''}`
            }
            onClick={() => setMenuOpen(false)}
          >
            Rent
          </NavLink>
          <NavLink
            to="/buy"
            className={({ isActive }) =>
              `nav__link ${isActive ? 'nav__link--active' : ''}`
            }
            onClick={() => setMenuOpen(false)}
          >
            Buy
          </NavLink>
        </nav>

        <div className="header__actions">
          <button className="btn btn--ghost">Sign In</button>
          <button className="btn btn--outline">List Property</button>
        </div>
      </div>
    </header>
  )
}
