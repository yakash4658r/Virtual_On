import { useState } from 'react'
import { FiChevronUp, FiChevronDown } from 'react-icons/fi'
import './DataTable.css'

function DataTable({ columns, data, onRowClick, emptyMessage = 'No data found', selectable = false }) {
  const [selectedRows, setSelectedRows] = useState([])
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(data.map((_, i) => i))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  let sortedData = [...(data || [])]
  if (sortKey) {
    sortedData.sort((a, b) => {
      const valA = a[sortKey] ?? ''
      const valB = b[sortKey] ?? ''
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA
      }
      return sortDir === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA))
    })
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      {selectable && selectedRows.length > 0 && (
        <div className="table-bulk-bar">
          <span>{selectedRows.length} selected</span>
        </div>
      )}
      <table className="data-table">
        <thead>
          <tr>
            {selectable && (
              <th className="table-checkbox-col">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedRows.length === data.length}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : {}}
                onClick={() => !col.render && handleSort(col.key)}
                className={!col.render ? 'sortable' : ''}
              >
                <span className="th-content">
                  {col.label}
                  {sortKey === col.key && (
                    <span className="sort-indicator">
                      {sortDir === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`${onRowClick ? 'clickable' : ''} ${selectedRows.includes(rowIndex) ? 'selected' : ''}`}
            >
              {selectable && (
                <td className="table-checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(rowIndex)}
                    onChange={() => handleSelectRow(rowIndex)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable