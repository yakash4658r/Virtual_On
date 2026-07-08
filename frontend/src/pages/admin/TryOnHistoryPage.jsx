import { useState, useEffect } from 'react'
import tryonAPI from '../../api/tryonAPI'
import DataTable from '../../components/admin/DataTable'
import Pagination from '../../components/common/Pagination'
import { PageLoader } from '../../components/common/Loader'
import { timeAgo, getStatusLabel } from '../../utils/helpers'
import './AdminPages.css'

function TryOnHistoryPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ total: 0, page: 1, total_pages: 1 })
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadHistory()
  }, [pagination.page, statusFilter])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const params = { page: pagination.page, page_size: 20 }
      if (statusFilter) params.status = statusFilter

      const res = await tryonAPI.adminGetHistory(params)
      setSessions(res.data.data)
      setPagination(res.data.pagination)
    } catch (error) {
      console.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'user_name', label: 'Customer', render: (val) => <strong style={{ color: 'var(--text-white)' }}>{val}</strong> },
    { key: 'user_email', label: 'Email' },
    { key: 'saree_count', label: 'Sarees' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <span className={`status-badge ${val}`}>{getStatusLabel(val)}</span>,
    },
    { key: 'progress', label: 'Progress' },
    { key: 'created_at', label: 'Time', render: (val) => timeAgo(val) },
  ]

  return (
    <div className="admin-page">
      <h1 className="admin-title">Try-On History</h1>

      <div className="admin-actions-bar">
        <div className="filter-pills">
          {['', 'pending', 'processing', 'completed', 'failed'].map((s) => (
            <button
              key={s}
              className={`filter-pill ${statusFilter === s ? 'active' : ''}`}
              onClick={() => { setStatusFilter(s); setPagination((p) => ({ ...p, page: 1 })) }}
            >
              {s === '' ? 'All' : getStatusLabel(s)}
            </button>
          ))}
        </div>
        <p className="results-count">{pagination.total} sessions</p>
      </div>

      {loading ? (
        <PageLoader text="Loading history..." />
      ) : (
        <>
          <DataTable columns={columns} data={sessions} emptyMessage="No try-on sessions found" />
          <Pagination page={pagination.page} totalPages={pagination.total_pages} onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))} />
        </>
      )}
    </div>
  )
}

export default TryOnHistoryPage