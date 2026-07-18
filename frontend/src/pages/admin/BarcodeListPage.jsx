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
      <head>
      <title>Barcode Labels for Printing</title>
      <style>
        @page { size: A4; margin: 0; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 10mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10mm; background: white; }
        .barcode-label { 
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 10px; border: 1px dashed #ccc; border-radius: 4px; height: 120px; page-break-inside: avoid;
        }
        .barcode-label img { max-width: 100%; max-height: 60px; object-fit: contain; }
        .label-text { margin: 4px 0 0; font-size: 11px; text-align: center; color: #333; font-weight: bold; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .price-text { margin: 0; font-size: 12px; color: #000; font-weight: 800; }
      </style>
      </head>
      <body>
    `

    barcodes.forEach((b) => {
      // Use absolute URL for print window since it opens about:blank
      const imgUrl = b.barcode_image?.startsWith('/') ? window.location.origin + b.barcode_image : b.barcode_image
      
      html += `
        <div class="barcode-label">
          ${imgUrl ? `<img src="${imgUrl}" crossorigin="anonymous" />` : `<div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">${b.barcode_id}</div>`}
          <p class="label-text">${b.name}</p>
          <p class="price-text">₹ ${b.price}</p>
        </div>
      `
    })

    html += '</body></html>'
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Wait for images to load before printing
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 500)
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