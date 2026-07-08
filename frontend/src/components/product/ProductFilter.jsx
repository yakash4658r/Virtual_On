import { useState, useEffect } from 'react'
import { FiFilter, FiX } from 'react-icons/fi'
import { FABRIC_OPTIONS, OCCASION_OPTIONS } from '../../utils/constants'
import productAPI from '../../api/productAPI'
import './ProductFilter.css'

function ProductFilter({ filters, onFilterChange, onReset }) {
  const [categories, setCategories] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await productAPI.getCategories()
      setCategories(res.data.data)
    } catch (error) {
      console.error('Failed to load categories')
    }
  }

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const activeCount = Object.values(filters).filter(
    (v) => v && v !== ''
  ).length

  return (
    <div className="filter-wrapper">
      <button
        className="filter-toggle"
        onClick={() => setShowFilters(!showFilters)}
      >
        <FiFilter />
        Filters
        {activeCount > 0 && (
          <span className="filter-count">{activeCount}</span>
        )}
      </button>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3>Filters</h3>
            <button className="filter-reset" onClick={onReset}>
              <FiX /> Clear All
            </button>
          </div>

          <div className="filter-grid">
            {/* Category */}
            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
                className="form-select"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name} ({cat.saree_count})
                  </option>
                ))}
              </select>
            </div>

            {/* Fabric */}
            <div className="filter-group">
              <label>Fabric</label>
              <select
                value={filters.fabric || ''}
                onChange={(e) => handleChange('fabric', e.target.value)}
                className="form-select"
              >
                <option value="">All Fabrics</option>
                {FABRIC_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Occasion */}
            <div className="filter-group">
              <label>Occasion</label>
              <select
                value={filters.occasion || ''}
                onChange={(e) => handleChange('occasion', e.target.value)}
                className="form-select"
              >
                <option value="">All Occasions</option>
                {OCCASION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <label>Min Price (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={filters.min_price || ''}
                onChange={(e) => handleChange('min_price', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Max Price (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="50000"
                value={filters.max_price || ''}
                onChange={(e) => handleChange('max_price', e.target.value)}
              />
            </div>

            {/* In Stock */}
            <div className="filter-group">
              <label>Availability</label>
              <select
                value={filters.in_stock || ''}
                onChange={(e) => handleChange('in_stock', e.target.value)}
                className="form-select"
              >
                <option value="">All</option>
                <option value="true">In Stock Only</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductFilter