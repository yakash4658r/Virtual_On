import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiCamera, FiShoppingBag, FiStar } from 'react-icons/fi'
import productAPI from '../../api/productAPI'
import ProductCard from '../../components/product/ProductCard'
import { PageLoader } from '../../components/common/Loader'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const [featuredSarees, setFeaturedSarees] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    try {
      const [sareeRes, catRes] = await Promise.all([
        productAPI.getAll({ featured: 'true', page_size: 8 }),
        productAPI.getCategories(),
      ])

      setFeaturedSarees(sareeRes.data.data)
      setCategories(catRes.data.data)
    } catch (error) {
      console.error('Failed to load home data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader text="Loading..." />

  return (
    <div className="home-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Try Sarees <span className="highlight">Virtually</span>
            <br />Before You Buy
          </h1>
          <p className="hero-subtitle">
            Browse our collection, select your favorites, and see how they
            look on you — all from your screen. No physical try-on needed.
          </p>
          <div className="hero-actions">
            <Link to="/catalog" className="hero-btn-primary">
              <FiShoppingBag /> Browse Collection
            </Link>
            <Link to="/register" className="hero-btn-secondary">
              Get Started <FiArrowRight />
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-icon"></div>
            <p>Select Saree</p>
          </div>
          <div className="hero-arrow">→</div>
          <div className="hero-card">
            <div className="hero-card-icon"></div>
            <p>Take Photo</p>
          </div>
          <div className="hero-arrow">→</div>
          <div className="hero-card">
            <div className="hero-card-icon"></div>
            <p>See Result</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <FiShoppingBag className="step-icon" />
            <h3>Browse & Select</h3>
            <p>Browse our saree catalog and add your favorites to the try-on cart</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <FiCamera className="step-icon" />
            <h3>Upload Photo</h3>
            <p>Upload your photo or take one with your camera</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <FiStar className="step-icon" />
            <h3>See Yourself</h3>
            <p>AI generates realistic images of you wearing each saree</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="categories-section">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.slug}`}
                className="category-card"
              >
                <div className="category-icon"></div>
                <h3>{cat.name}</h3>
                <p>{cat.saree_count} Sarees</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Sarees */}
      {featuredSarees.length > 0 && (
        <section className="featured-section">
          <div className="section-header">
            <h2 className="section-title">Featured Sarees</h2>
            <Link to="/catalog" className="view-all-link">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="product-grid">
            {featuredSarees.map((saree) => (
              <ProductCard key={saree.id} saree={saree} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Try On?</h2>
        <p>Create an account and start your virtual try-on experience</p>
        <Link to="/register" className="hero-btn-primary">
          Start Now — It's Free <FiArrowRight />
        </Link>
      </section>

    </div>
  )
}

export default HomePage