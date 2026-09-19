import '../Styles/components.css';

export default function Pagination({
  currentPage,
  lastPage,
  onPageChange,
  isLoading,
}) {
  if (lastPage <= 1) return null;

  // Generar un rango de páginas a mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(lastPage, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className="pagination" aria-label="Paginación de resultados">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1 || isLoading}
        aria-label="Primera página"
      >
        ««
      </button>

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        aria-label="Página anterior"
      >
        «
      </button>

      {pages.map((page) => (
        <button
          key={page}
          className={`pagination-btn ${
            page === currentPage ? 'active' : ''
          }`}
          onClick={() => onPageChange(page)}
          disabled={isLoading}
          aria-label={`Ir a página ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage || isLoading}
        aria-label="Página siguiente"
      >
        »
      </button>

      <button
        className="pagination-btn"
        onClick={() => onPageChange(lastPage)}
        disabled={currentPage === lastPage || isLoading}
        aria-label="Última página"
      >
        »»
      </button>
    </nav>
  );
}
