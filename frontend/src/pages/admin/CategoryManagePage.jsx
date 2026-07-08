import { useState, useEffect } from 'react'
import { FiPlus } from 'react-icons/fi'
import productAPI from '../../api/productAPI'
import DataTable from '../../components/admin/DataTable'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { PageLoader } from '../../components/common/Loader'
import toast from 'react-hot-toast'
import './AdminPages.css'

function CategoryManagePage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const res = await productAPI.getCategories()
      setCategories(res.data.data)
    } catch (error) {
      console.error('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) {
      toast.error('Category name is required')
      return
    }

    setSaving(true)
    try {
      await productAPI.adminCreateCategory({ name: newName, description: newDesc })
      toast.success('Category created!')
      setShowModal(false)
      setNewName('')
      setNewDesc('')
      loadCategories()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Name', render: (val) => <strong style={{ color: 'var(--text-white)' }}>{val}</strong> },
    { key: 'slug', label: 'Slug', render: (val) => <code className="table-code">{val}</code> },
    { key: 'saree_count', label: 'Sarees' },
    {
      key: 'is_active',
      label: 'Status',
      render: (val) => <span className={`status-badge ${val ? 'completed' : 'failed'}`}>{val ? 'Active' : 'Inactive'}</span>,
    },
  ]

  if (loading) return <PageLoader text="Loading categories..." />

  return (
    <div className="admin-page">
      <div className="admin-actions-bar">
        <h1 className="admin-title">Categories ({categories.length})</h1>
        <Button variant="primary" icon={<FiPlus />} onClick={() => setShowModal(true)}>
          Add Category
        </Button>
      </div>

      <DataTable columns={columns} data={categories} emptyMessage="No categories yet" />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Category" size="small">
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input type="text" className="form-input" placeholder="e.g., Kanjivaram" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows="2" placeholder="Optional description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          </div>
          <Button type="submit" variant="success" fullWidth loading={saving}>
            Create Category
          </Button>
        </form>
      </Modal>
    </div>
  )
}

export default CategoryManagePage