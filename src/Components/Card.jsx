import '../Styles/components.css';

export default function Card({ anime, onClick }) {
  const imageUrl =
    anime.images?.webp?.image_url ||
    anime.images?.jpg?.image_url ||
    'https://via.placeholder.com/225x318?text=Sin+Imagen';

  // Dato distintivo: tipo + estado
  const distinctiveInfo = [anime.type, anime.status]
    .filter(Boolean)
    .join(' • ');

  // Color del badge según el score
  const getScoreColor = (score) => {
    if (!score) return '#666';
    if (score >= 8.5) return '#00d9a5';
    if (score >= 7) return '#ffc107';
    return '#ff6b6b';
  };

  const description = anime.synopsis
    ?.replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <article
      className="anime-card"
      onClick={() => onClick(anime)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => e.key === 'Enter' && onClick(anime)}
      aria-label={`Ver detalles de ${anime.title}`}
    >
      <div className="card-image-wrapper">
        <img
          src={imageUrl}
          alt={anime.title}
          className="card-image"
          loading="lazy"
        />
        {anime.score > 0 && (
          <span
            className="card-score"
            style={{ backgroundColor: getScoreColor(anime.score) }}
          >
            ★ {anime.score}
          </span>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-title" title={anime.title}>
          {anime.title}
        </h3>

        {anime.title_english && anime.title_english !== anime.title && (
          <p className="card-subtitle" title={anime.title_english}>
            {anime.title_english}
          </p>
        )}

        {distinctiveInfo && (
          <span className="card-badge">{distinctiveInfo}</span>
        )}

        <p className="card-description">
          {description || 'Sin descripción disponible para este anime.'}
        </p>

        {anime.episodes && (
          <p className="card-meta">📺 {anime.episodes} episodios</p>
        )}
      </div>
    </article>
  );
}
