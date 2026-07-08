import { getImageUrl } from '../../utils/helpers'
import './BarcodeDisplay.css'

function BarcodeDisplay({ barcodeId, barcodeImage, sareeName, price }) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head><title>Barcode - ${barcodeId}</title></head>
        <body style="text-align:center;padding:20px;">
          <img src="${getImageUrl(barcodeImage)}" style="max-width:300px;" />
          <p style="margin-top:10px;font-family:sans-serif;">
            ${sareeName} - Rs. ${price}
          </p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="barcode-display">
      {barcodeImage ? (
        <img
          src={getImageUrl(barcodeImage)}
          alt={`Barcode ${barcodeId}`}
          className="barcode-img"
          onError={(e) => {
            e.target.src = 'https://placehold.co/200x100/fff/000?text=' + barcodeId
          }}
        />
      ) : (
        <div className="barcode-text-only">
          <p className="barcode-code">{barcodeId}</p>
        </div>
      )}

      <div className="barcode-actions">
        <span className="barcode-id">{barcodeId}</span>
        <button className="barcode-print-btn" onClick={handlePrint}>
           Print
        </button>
      </div>
    </div>
  )
}

export default BarcodeDisplay