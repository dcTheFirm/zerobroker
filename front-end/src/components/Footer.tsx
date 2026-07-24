import { Link } from 'react-router-dom'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">ZeroBroker</div>
            <p className="footer__desc">
              India&apos;s brokerage-free platform for renting and buying homes.
              Connect directly with owners — save lakhs on every deal.
            </p>
          </div>
          <div>
            <h4 className="footer__heading">Explore</h4>
            <ul className="footer__links">
              <li><Link to="/rent">Rent Homes</Link></li>
              <li><Link to="/buy">Buy Properties</Link></li>
              <li><Link to="/">Featured Listings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="footer__heading">Cities</h4>
            <ul className="footer__links">
              <li><Link to="/rent?city=Mumbai">Mumbai</Link></li>
              <li><Link to="/rent?city=Bangalore">Bangalore</Link></li>
              <li><Link to="/rent?city=Delhi NCR">Delhi NCR</Link></li>
              <li><Link to="/rent?city=Hyderabad">Hyderabad</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="footer__heading">Company</h4>
            <ul className="footer__links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 ZeroBroker. All rights reserved.</span>
          <span className="footer__zero">Zero brokerage. Always.</span>
        </div>
      </div>
    </footer>
  )
}
