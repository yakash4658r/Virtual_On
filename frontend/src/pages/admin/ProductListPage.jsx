import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPlus, FiEdit, FiTrash2, FiGrid, FiList } from 'react-icons/fi'
import productAPI from '../../api/productAPI'
import DataTable from '../../components/admin/DataTable'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import Button from '../../components/common/Button'
import { PageLoader } from '../../components/common/Loader'
import { formatPrice, getImageUrl } from '../../utils/helpers'
import ImagePreview from '../../components/common/ImagePreview'
import toast from 'react-hot-toast'
import './AdminPages.css'

function ProductListPage() {
  const navigate = useNavigate()
  const [sarees, setSarees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('table')
  const [pagination, setPagination] = useState({ total: 0, page: 1, total_pages: 1 })

  useEffect(() => {
    loadSarees()
  }, [search, pagination.page])

  const loadSarees = async () => {
    try {
      setLoading(true)
      const params = { page: pagination.page, page_size: 15 }
      if (search) params.search = search

      const res = await productAPI.adminGetAll(params)
      setSarees(res.data.data)
      setPagination(res.data.pagination)
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return

    try {
      await productAPI.adminDelete(id)
      toast.success('Saree deleted')
      loadSarees()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const columns = [
    {
      key: 'image_front',
      label: 'Image',
      width: '70px',
      render: (val) => (
        <ImagePreview src={val} alt="Saree" className="table-thumb" />
      ),
    },
    { key: 'name', label: 'Name', render: (val) => <span className="table-name">{val}</span> },
    { key: 'barcode_id', label: 'Barcode', render: (val) => <code className="table-code">{val}</code> },
    {
      key: 'price',
      label: 'Price',
      render: (val) => <span className="table-price">{formatPrice(val)}</span>,
    },
    { key: 'fabric', label: 'Fabric', render: (val) => <span className="table-capitalize">{val}</span> },
    {
      key: 'in_stock',
      label: 'Stock',
      render: (val) => (
        <span className={`status-badge ${val ? 'completed' : 'failed'}`}>
          {val ? 'In Stock' : 'Out'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (val) => (
        <span className={`status-badge ${val ? 'completed' : 'failed'}`}>
          {val ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Actions',
      render: (val, row) => (
        <div className="table-actions">
          <button className="table-action-btn edit" onClick={(e) => { e.stopPropagation(); navigate(`/admin/products/edit/${val}`) }}>
            <FiEdit />
          </button>
          <button className="table-action-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(val, row.name) }}>
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="admin-page">
      <div className="admin-actions-bar">
        <h1 className="admin-title" style={{ marginBottom: 0 }}>Products ({pagination.total})</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <FiList />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FiGrid />
            </button>
          </div>
          <Link to="/admin/products/add">
            <Button variant="primary" icon={<FiPlus />}>Add Saree</Button>
          </Link>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <SearchBar
          onSearch={(q) => { setSearch(q); setPagination((p) => ({ ...p, page: 1 })) }}
          placeholder="Search by name or barcode..."
        />
      </div>

      {loading ? (
        <PageLoader text="Loading products..." />
      ) : (
        <>
          <DataTable columns={columns} data={sarees} emptyMessage="No sarees found" selectable={true} />
          <Pagination page={pagination.page} totalPages={pagination.total_pages} onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))} />
        </>
      )}
    </div>
  )
}

export default ProductListPage