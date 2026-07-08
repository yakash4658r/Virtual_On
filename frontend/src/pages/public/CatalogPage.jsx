import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import productAPI from '../../api/productAPI'
import ProductCard from '../../components/product/ProductCard'
import ProductFilter from '../../components/product/ProductFilter'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import { PageLoader } from '../../components/common/Loader'
import './CatalogPage.css'

function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [sarees, setSarees] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 12,
    total_pages: 1,
  })

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    fabric: searchParams.get('fabric') || '',
    occasion: searchParams.get('occasion') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    in_stock: searchParams.get('in_stock') || '',
    search: searchParams.get('search') || '',
  })

  useEffect(() => {
    loadSarees()
  }, [filters, pagination.page])

  const loadSarees = async () => {
    try {
      setLoading(true)

      // Build params — remove empty values
      const params = { page: pagination.page, page_size: 12 }
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params[key] = value
        }
      })

      const res = await productAPI.getAll(params)

      setSarees(res.data.data)
      setPagination(res.data.pagination)

      // Update URL params
      const newParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value && key !== 'page' && key !== 'page_size') {
          newParams.set(key, value)
        }
      })
      setSearchParams(newParams)

    } catch (error) {
      console.error('Failed to load sarees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setFilters((prev) => ({ ...prev, search: query }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterReset = () => {
    setFilters({
      category: '', fabric: '', occasion: '',
      min_price: '', max_price: '', in_stock: '',
      search: '',
    })
    setPagination((prev) => ({ ...prev, page: 1 }))
    setSearchParams({})
  }

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <h1 className="section-title">Saree Collection</h1>
        <p className="section-subtitle">
          {pagination.total} sarees available
        </p>
      </div>

      <div className="catalog-controls">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by name, color, barcode..."
        />

        <ProductFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleFilterReset}
        />
      </div>

      {loading ? (
        <PageLoader text="Loading sarees..." />
      ) : sarees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"></div>
          <p className="empty-state-text">
            No sarees found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {sarees.map((saree) => (
              <ProductCard key={saree.id} saree={saree} />
            ))}
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.total_pages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}

export default CatalogPage