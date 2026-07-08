import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import productAPI from '../../api/productAPI'
import SareeUploadForm from '../../components/admin/SareeUploadForm'
import { PageLoader } from '../../components/common/Loader'
import './AdminPages.css'

function ProductEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [saree, setSaree] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSaree()
  }, [id])

  const loadSaree = async () => {
    try {
      const res = await productAPI.adminGetAll({ search: id })
      const found = res.data.data.find((s) => s.id === id)
      setSaree(found || null)
    } catch (error) {
      console.error('Failed to load saree')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader text="Loading saree..." />

  if (!saree) {
    return (
      <div className="admin-page">
        <p className="admin-error">Saree not found</p>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <h1 className="admin-title">Edit: {saree.name}</h1>
      <p className="section-subtitle">Barcode: {saree.barcode_id}</p>
      <SareeUploadForm editData={saree} onSuccess={() => navigate('/admin/products')} />
    </div>
  )
}

export default ProductEditPage