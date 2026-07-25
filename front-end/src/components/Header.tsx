import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { getCurrentUser, signOut, subscribeAuthChanges } from '../services/auth'
import './Header.css'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(getCurrentUser())

  useEffect(() => {
    return subscribeAuthChanges(setUser)
  }, [])

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
          {user ? (
            <>
              <span className="header__user">{user.email}</span>
              <button className="btn btn--ghost" onClick={signOut}>
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/signin" className="btn btn--ghost">
              Sign In
            </Link>
          )}
          <Link to="/list-property" className="btn btn--outline">
            List Property
          </Link>
        </div>
      </div>
    </header>
  )
}
