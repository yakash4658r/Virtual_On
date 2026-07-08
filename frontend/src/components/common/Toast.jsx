import { Toaster } from 'react-hot-toast'

function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#2D1525',
          color: '#F5E6EE',
          border: '1px solid #4A2A3A',
          borderRadius: '12px',
          padding: '14px 20px',
          fontSize: '0.95rem',
        },
        success: {
          iconTheme: {
            primary: '#4CAF50',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#F44336',
            secondary: '#fff',
          },
          duration: 4000,
        },
      }}
    />
  )
}

export default ToastProvider