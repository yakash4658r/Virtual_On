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
            The Future of <span className="highlight">Saree Shopping</span>
          </h1>
          <p className="hero-subtitle">
            Experience our premium collection through AI-powered virtual try-ons. 
            See how luxury looks on you before you buy, seamlessly and instantly.
          </p>
          <div className="hero-actions">
            <Link to="/catalog" className="hero-btn-primary">
              <FiShoppingBag /> Explore Collection
            </Link>
            <Link to="/register" className="hero-btn-secondary">
              Virtual Try-On <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works with AI Generated Images */}
      <section className="how-section main-content">
        <h2 className="section-title" style={{textAlign: 'center'}}>The Virtual Experience</h2>
        <p className="section-subtitle" style={{textAlign: 'center'}}>Three simple steps to see yourself in luxury silk.</p>
        
        <div className="steps-grid">
          <div className="step-card glass-panel">
            <div className="step-number">1</div>
            <img src="/images/saree_collection.png" alt="Select Saree" className="step-image" />
            <div className="step-content">
              <h3>Browse the Collection</h3>
              <p>Explore our curated selection of premium Kanjivaram and silk sarees.</p>
            </div>
          </div>
          
          <div className="step-card glass-panel">
            <div className="step-number">2</div>
            <img src="/images/mirror_interaction.png" alt="Interact with Mirror" className="step-image" />
            <div className="step-content">
              <h3>Take a Photo</h3>
              <p>Use your camera or the Smart Mirror kiosk to capture your photo.</p>
            </div>
          </div>
          
          <div className="step-card glass-panel">
            <div className="step-number">3</div>
            <img src="/images/mirror_tryon.png" alt="See Result" className="step-image" />
            <div className="step-content">
              <h3>Instant Try-On</h3>
              <p>Our advanced AI instantly drapes the saree over your image flawlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="categories-section">
          <div className="main-content">
            <h2 className="section-title">Curated Collections</h2>
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${cat.slug}`}
                  className="category-card glass-panel"
                >
                  <h3>{cat.name}</h3>
                  <p>{cat.saree_count} Exclusive Designs</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Sarees */}
      {featuredSarees.length > 0 && (
        <section className="featured-section main-content">
          <div className="section-header">
            <div>
              <h2 className="section-title" style={{marginBottom: '5px'}}>Featured Masterpieces</h2>
              <p className="section-subtitle" style={{marginBottom: 0}}>Hand-picked selections for the season.</p>
            </div>
            <Link to="/catalog" className="view-all-link">
              View Collection <FiArrowRight />
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
        <div className="main-content">
          <h2>Step Into The Future</h2>
          <p>Join thousands who have revolutionized their shopping experience.</p>
          <Link to="/register" className="hero-btn-primary">
            Create Free Account <FiArrowRight />
          </Link>
        </div>
      </section>

    </div>
  )
}

export default HomePage