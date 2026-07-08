import { useNavigate } from 'react-router-dom'
import SareeUploadForm from '../../components/admin/SareeUploadForm'
import './AdminPages.css'

function ProductAddPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/admin/products')
  }

  return (
    <div className="admin-page">
      <h1 className="admin-title">Add New Saree</h1>
      <p className="section-subtitle">
        Upload saree images and details. Barcode will be generated automatically.
      </p>
      <SareeUploadForm onSuccess={handleSuccess} />
    </div>
  )
}

export default ProductAddPage