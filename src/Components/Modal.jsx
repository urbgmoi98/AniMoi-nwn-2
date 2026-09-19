import { useEffect } from 'react';
import Loader from './Loader';
import '../Styles/components.css';

export default function Modal({ anime, details, isLoading, onClose }) {
  // Cerrar con tecla Escape
  useEffect(() => {
    if (!anime) return undefined;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [anime, onClose]);

  if (!anime) return null;

  const data = details || anime;
  const imageUrl =
    data.images?.webp?.large_image_url ||
    data.images?.jpg?.large_image_url ||
    data.images?.webp?.image_url ||
    data.images?.jpg?.image_url ||
    'https://via.placeholder.com/400x600?text=Sin+Imagen';

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalles de ${data.title}`}
    >
      <div className="modal-content">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        {isLoading ? (
          <div className="modal-loader">
            <Loader message="Cargando detalles..." />
          </div>
        ) : (
          <div className="modal-body">
            <div className="modal-header">
              <img
                src={imageUrl}
                alt={data.title}
                className="modal-image"
              />
              <div className="modal-header-info">
                <h2 className="modal-title">{data.title}</h2>
                {data.title_japanese && (
                  <p className="modal-japanese">{data.title_japanese}</p>
                )}
                {data.title_english && data.title_english !== data.title && (
                  <p className="modal-english">{data.title_english}</p>
                )}

                <div className="modal-badges">
                  {data.type && (
                    <span className="modal-badge type">{data.type}</span>
                  )}
                  {data.status && (
                    <span className="modal-badge status">{data.status}</span>
                  )}
                  {data.rating && (
                    <span className="modal-badge rating">{data.rating}</span>
                  )}
                </div>
              </div>
            </div>

            {data.synopsis && (
              <div className="modal-section">
                <h3>📖 Sinopsis</h3>
                <p className="modal-synopsis">{data.synopsis}</p>
              </div>
            )}

            <div className="modal-stats-grid">
              {data.score > 0 && (
                <div className="modal-stat">
                  <span className="stat-label">Puntuación</span>
                  <span className="stat-value">★ {data.score}</span>
                </div>
              )}
              {data.rank && (
                <div className="modal-stat">
                  <span className="stat-label">Ranking</span>
                  <span className="stat-value">#{data.rank}</span>
                </div>
              )}
              {data.popularity && (
                <div className="modal-stat">
                  <span className="stat-label">Popularidad</span>
                  <span className="stat-value">#{data.popularity}</span>
                </div>
              )}
              {data.members && (
                <div className="modal-stat">
                  <span className="stat-label">Miembros</span>
                  <span className="stat-value">
                    {data.members.toLocaleString()}
                  </span>
                </div>
              )}
              {data.episodes && (
                <div className="modal-stat">
                  <span className="stat-label">Episodios</span>
                  <span className="stat-value">{data.episodes}</span>
                </div>
              )}
              {data.duration && (
                <div className="modal-stat">
                  <span className="stat-label">Duración</span>
                  <span className="stat-value">{data.duration}</span>
                </div>
              )}
              {data.aired?.string && (
                <div className="modal-stat">
                  <span className="stat-label">Emisión</span>
                  <span className="stat-value">{data.aired.string}</span>
                </div>
              )}
              {data.source && (
                <div className="modal-stat">
                  <span className="stat-label">Fuente</span>
                  <span className="stat-value">{data.source}</span>
                </div>
              )}
            </div>

            {data.genres?.length > 0 && (
              <div className="modal-section">
                <h3>🎭 Géneros</h3>
                <div className="modal-genres">
                  {data.genres.map((genre) => (
                    <span key={genre.mal_id} className="genre-tag">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.studios?.length > 0 && (
              <div className="modal-section">
                <h3>🏢 Estudios</h3>
                <div className="modal-genres">
                  {data.studios.map((studio) => (
                    <span key={studio.mal_id} className="genre-tag studio">
                      {studio.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.trailer?.url && (
              <div className="modal-section">
                <a
                  href={data.trailer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-trailer-btn"
                >
                  ▶ Ver Trailer
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
