import { useState } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import './SearchBar.css'

function SearchBar({ onSearch, placeholder = 'Search sarees...' }) {

  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <FiSearch className="search-icon" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {query && (
        <button
          type="button"
          className="search-clear"
          onClick={handleClear}
        >
          <FiX />
        </button>
      )}
      <button type="submit" className="search-btn">
        Search
      </button>
    </form>
  )
}

export default SearchBar