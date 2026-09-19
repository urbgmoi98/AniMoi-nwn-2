import { useState, useEffect, useCallback, useRef } from 'react';
import Card from './Components/Card';
import SearchBar from './Components/SearchBar.jsx';
import Loader from './Components/Loader';
import Modal from './Components/Modal';
import Pagination from './Components/Pagination';
import ErrorMessage from './Components/ErrorMessage';
import { fetchAnimeList, fetchAnimeById } from './Services/animeApi';

const playCardOpenSound = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(520, now);
    oscillator.frequency.exponentialRampToValueAtTime(760, now + 0.09);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.16);
    oscillator.addEventListener('ended', () => context.close());
  } catch {
    // El detalle sigue abriéndose cuando el navegador no permite audio.
  }
};

export default function App() {
  // --- Estado del listado ---
  const [animeList, setAnimeList] = useState([]);
  const [pagination, setPagination] = useState({
    last_visible_page: 1,
    has_next_page: false,
    current_page: 1,
  });
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // --- Estados de UI ---
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estado del modal ---
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [animeDetails, setAnimeDetails] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const latestRequest = useRef(0);

  /**
   * Carga el listado de anime según la búsqueda y página actual.
   */
  const loadAnime = useCallback(async () => {
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchAnimeList({
        query,
        page: currentPage,
      });
      if (requestId !== latestRequest.current) return;
      setAnimeList(result.anime);
      setPagination(result.pagination);
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      setError(err.message || 'Error desconocido al cargar los datos.');
      setAnimeList([]);
    } finally {
      if (requestId === latestRequest.current) {
        setIsLoading(false);
      }
    }
  }, [query, currentPage]);

  // Efecto: cargar datos cuando cambia la búsqueda o la página
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAnime();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadAnime]);

  /**
   * Maneja la búsqueda: resetea a página 1.
   */
  const handleSearch = useCallback((term) => {
    setQuery(term);
    setCurrentPage(1);
  }, []);

  /**
   * Maneja el cambio de página.
   */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /**
   * Abre el modal y carga los detalles completos del anime.
   */
  const handleCardClick = useCallback(async (anime) => {
    playCardOpenSound();
    setSelectedAnime(anime);
    setAnimeDetails(null);
    setIsDetailLoading(true);

    try {
      const details = await fetchAnimeById(anime.anilist_id);
      setAnimeDetails(details);
    } catch (err) {
      // Si falla, mostramos los datos que ya teníamos de la tarjeta
      console.error('Error al cargar detalles:', err);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  /**
   * Cierra el modal.
   */
  const handleCloseModal = useCallback(() => {
    setSelectedAnime(null);
    setAnimeDetails(null);
  }, []);

  return (
    <div className="app">
      {/* ===== HEADER: Portada estilo Shonen Jump ===== */}
      <header className="app-header">
        <div className="header-glow"></div>
        <h1 className="app-title">
          <span className="title-jp">アニメ</span>
          <span className="title-main">AniMOI</span>
        </h1>
        <p className="app-subtitle"> Tu animeList favorita a la mano. </p>
      </header>

      {/* ===== BUSCADOR ===== */}
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="app-main">
        {/* Estado de error */}
        {error && !isLoading && (
          <ErrorMessage message={error} onRetry={loadAnime} />
        )}

        {/* Estado de carga */}
        {isLoading && (
          <Loader message="Cargando el siguiente capítulo..." />
        )}

        {/* Listado de resultados */}
        {!isLoading && !error && (
          <>
            {animeList.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">💥</span>
                <h3>¡Sin resultados!</h3>
                <p>
                  {query
                    ? `No encontramos nada para "${query}". ¡Prueba con otro término!`
                    : 'No hay datos disponibles en este momento.'}
                </p>
              </div>
            ) : (
              <>
                <div className="results-info">
                  Página {pagination.current_page} de{' '}
                  {pagination.last_visible_page} — {animeList.length} resultados
                </div>

                <div className="anime-grid">
                  {animeList.map((anime) => (
                    <Card
                      key={anime.mal_id}
                      anime={anime}
                      onClick={handleCardClick}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={pagination.current_page}
                  lastPage={pagination.last_visible_page}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* ===== MODAL DE DETALLES ===== */}
      <Modal
        anime={selectedAnime}
        details={animeDetails}
        isLoading={isDetailLoading}
        onClose={handleCloseModal}
      />

      {/* ===== FOOTER: Créditos de capítulo ===== */}
      <footer className="app-footer">
        <p>
          Datos proporcionados por{' '}
          <a
            href="https://anilist.co/"
            target="_blank"
            rel="noopener noreferrer"
          >
            AniList API
          </a>{' '}
          — Datos de AniList
        </p>
      </footer>
    </div>
  );
}
