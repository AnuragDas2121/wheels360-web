import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-bold font-montserrat">
                Wheels<span className="text-secondary">360</span>
              </span>
            </Link>
            <p className="text-neutral-lightest opacity-80 mb-6">
              India's premier automotive marketplace connecting car buyers with trusted dealers across the country, from Mumbai to Delhi, Bangalore to Chennai.
            </p>
            <p className="text-neutral-lightest opacity-80 mb-6">
              <strong>Contact:</strong> +91 9876543210<br />
              <strong>Email:</strong> info@wheels360.in
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-secondary transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-white hover:text-secondary transition">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold font-montserrat mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/"
                  className="text-neutral-lightest hover:text-secondary transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/cars"
                  className="text-neutral-lightest hover:text-secondary transition"
                >
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link 
                  to="/dealers"
                  className="text-neutral-lightest hover:text-secondary transition"
                >
                  Find Dealers
                </Link>
              </li>
              <li>
                <Link 
                  to="/compare"
                  className="text-neutral-lightest hover:text-secondary transition"
                >
                  Compare Vehicles
                </Link>
              </li>
              <li>
                <Link 
                  to="/"
                  className="text-neutral-lightest hover:text-secondary transition"
                >
                  Market Trends
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold font-montserrat mb-6">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/"
                  className="text-neutral-lightest hover:text-secondary transition"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/"
                  className="text-neutral-lightest hover:text-secondary transition"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/"
                  className="text-neutral-lightest hover:text-secondary transition"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link 
                  to="/"
                  className="text-neutral-lightest hover:text-secondary transition"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/"
                  className="text-neutral-lightest hover:text-secondary transition"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold font-montserrat mb-6">Subscribe for Updates</h4>
            <p className="text-neutral-lightest opacity-80 mb-4">
              Get the latest updates on new inventory, price drops, and exclusive offers for Indian car buyers.
            </p>
            <form className="mb-4">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address (example@gmail.com)"
                  className="w-full px-4 py-2 rounded-l-md text-neutral-dark outline-none"
                />
                <button
                  type="submit"
                  className="bg-secondary hover:bg-secondary-light px-4 rounded-r-md transition"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
            <p className="text-sm text-neutral-lightest opacity-70">
              By subscribing, you agree to our terms and policies in accordance with Indian consumer protection laws.
            </p>
          </div>
        </div>

        <div className="border-t border-primary-light pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-lightest opacity-70 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Wheels360 India Pvt. Ltd. All rights reserved. | Registered in Mumbai, Maharashtra.
            </p>
            <div className="flex space-x-6">
              <Link 
                to="/"
                className="text-sm text-neutral-lightest opacity-70 hover:opacity-100 transition"
              >
                Terms
              </Link>
              <Link 
                to="/"
                className="text-sm text-neutral-lightest opacity-70 hover:opacity-100 transition"
              >
                Privacy
              </Link>
              <Link 
                to="/"
                className="text-sm text-neutral-lightest opacity-70 hover:opacity-100 transition"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
