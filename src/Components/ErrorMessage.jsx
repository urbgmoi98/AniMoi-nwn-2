import '../Styles/components.css';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">¡Algo salió mal!</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
