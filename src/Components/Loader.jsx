import '../Styles/components.css';

export default function Loader({ message = 'Cargando...' }) {
  return (
    <div className="loader-container">
      <div className="loader-spinner">
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
      </div>
      <p className="loader-message">{message}</p>
    </div>
  );
}
