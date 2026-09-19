import { useState, useEffect } from 'react';
import '../Styles/components.css';

export default function SearchBar({ onSearch, isLoading }) {
  const [term, setTerm] = useState('');

  // Debounce: espera 500ms después de que el usuario deja de escribir.
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(term);
    }, 500);

    return () => clearTimeout(timer);
  }, [term, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(term);
  };

  const handleClear = () => {
    setTerm('');
    onSearch('');
  };

  return (
    <form className="searchbar" onSubmit={handleSubmit}>
      <div className="searchbar-wrapper">
        <span className="searchbar-icon">🔍</span>
        <input
          type="text"
          className="searchbar-input"
          placeholder="Busca tu anime favorito..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          aria-busy={isLoading}
          aria-label="Buscar anime por nombre"
        />
        {term && (
          <button
            type="button"
            className="searchbar-clear"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
}
