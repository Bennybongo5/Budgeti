import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ fontFamily: "system-ui,sans-serif", padding: 30, textAlign: "center", background: "#fdf8e1", minHeight: "100vh" }}>
          <p style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia,serif", marginBottom: 12 }}>Budgeti</p>
          <p style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>Une erreur est survenue. Rechargez la page.</p>
          <button onClick={() => window.location.reload()} style={{ padding: "12px 24px", background: "#8ab87a", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, cursor: "pointer" }}>Recharger</button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
