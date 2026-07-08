import { useState, useEffect } from 'react'
import productAPI from '../../api/productAPI'
import BarcodeDisplay from '../../components/admin/BarcodeDisplay'
import { PageLoader } from '../../components/common/Loader'
import Button from '../../components/common/Button'
import './AdminPages.css'
import './BarcodeListPage.css'

function BarcodeListPage() {
  const [barcodes, setBarcodes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBarcodes()
  }, [])

  const loadBarcodes = async () => {
    try {
      const res = await productAPI.adminGetAllBarcodes()
      setBarcodes(res.data.data)
    } catch (error) {
      console.error('Failed to load barcodes')
    } finally {
      setLoading(false)
    }
  }

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank')
    let html = `
      <html>
      <head><title>All Barcodes</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        .barcode-item { display: inline-block; text-align: center; margin: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
        .barcode-item img { max-width: 200px; }
        .barcode-item p { margin: 5px 0; font-size: 12px; }
      </style>
      </head><body><h2>Saree Barcodes</h2>
    `

    barcodes.forEach((b) => {
      html += `
        <div class="barcode-item">
          ${b.barcode_image ? `<img src="${b.barcode_image}" />` : `<p><strong>${b.barcode_id}</strong></p>`}
          <p>${b.name}</p>
          <p>Rs. ${b.price}</p>
        </div>
      `
    })

    html += '</body></html>'
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  if (loading) return <PageLoader text="Loading barcodes..." />

  return (
    <div className="admin-page">
      <div className="admin-actions-bar">
        <h1 className="admin-title">Barcodes ({barcodes.length})</h1>
        <Button variant="primary" onClick={handlePrintAll}> Print All</Button>
      </div>

      {barcodes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"></div>
          <p className="empty-state-text">No barcodes generated yet. Add sarees first.</p>
        </div>
      ) : (
        <div className="barcodes-grid">
          {barcodes.map((b) => (
            <BarcodeDisplay
              key={b.id}
              barcodeId={b.barcode_id}
              barcodeImage={b.barcode_image}
              sareeName={b.name}
              price={b.price}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BarcodeListPage