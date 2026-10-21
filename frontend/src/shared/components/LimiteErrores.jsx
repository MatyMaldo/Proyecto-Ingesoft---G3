import { Component } from 'react';

import EstadoConsulta from './EstadoConsulta.jsx';

/**
 * Límite de errores de renderizado (error boundary). Ante un error no controlado
 * muestra el mensaje genérico de EAC-13, sin detalles técnicos, y mantiene vivo
 * el resto del layout. Se reinicia cuando cambia la prop `clave` (p. ej. al navegar).
 *
 * TODO(backend): reportar el error al log cuando exista el endpoint.
 */
export default class LimiteErrores extends Component {
  state = { tieneError: false };

  static getDerivedStateFromError() {
    return { tieneError: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.error('LimiteErrores capturó un error de renderizado:', error);
    }
  }

  componentDidUpdate(propsAnteriores) {
    if (this.state.tieneError && propsAnteriores.clave !== this.props.clave) {
      this.setState({ tieneError: false });
    }
  }

  render() {
    if (this.state.tieneError) {
      return <EstadoConsulta tipo="error" />;
    }

    return this.props.children;
  }
}
