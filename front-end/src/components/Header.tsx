import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { getCurrentUser, signOut, subscribeAuthChanges } from '../services/auth'
import './Header.css'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(getCurrentUser())
  useEffect(() => subscribeAuthChanges(setUser), [])

  const close = () => setMenuOpen(false)
  return <header className="header">
    <div className="container header__inner">
      <Link to="/" className="logo" onClick={close} aria-label="ZeroBroker home">
        <span className="logo__architect" aria-hidden="true"><i /><i /><i /></span>
        <span className="logo__word">ZERO<span>BROKER</span></span>
      </Link>
      <button className="menu-toggle" aria-label="Toggle navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /> <span /></button>
      <nav className={`nav ${menuOpen ? 'nav--open' : ''}`}>
        <NavLink to="/" end className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`} onClick={close}>Discover</NavLink>
        <NavLink to="/rent" className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`} onClick={close}>Rent</NavLink>
        <NavLink to="/buy" className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`} onClick={close}>Buy</NavLink>
      </nav>
      <div className="header__actions">
        {user ? <><span className="header__user">{user.email}</span><button className="btn btn--ghost" onClick={signOut}>Sign out</button></> : <><Link to="/signin" className="btn btn--ghost">Sign in</Link><Link to="/signup" className="btn btn--ghost">Sign up</Link></>}
        <Link to="/list-property" className="btn btn--outline">List a home <span aria-hidden="true">↗</span></Link>
      </div>
    </div>
  </header>
}
