import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

// Con toda la suite en paralelo, los `findBy*`/`waitFor` de 1 s (valor por defecto) fallan a veces por carga de CPU.
configure({ asyncUtilTimeout: 4000 });

// jsdom no implementa showModal()/close() de <dialog> ni el cierre con Esc. Se simulan igual que un navegador:
// showModal abre, Esc lanza el evento `cancel` sobre el diálogo de más arriba y, si nadie lo cancela, lo cierra.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute('open')) {
      return;
    }
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
  document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape') {
      return;
    }
    const abiertos = document.querySelectorAll('dialog[open]');
    const superior = abiertos[abiertos.length - 1];
    if (!superior) {
      return;
    }
    const cancelacion = new Event('cancel', { cancelable: true });
    superior.dispatchEvent(cancelacion);
    if (!cancelacion.defaultPrevented) {
      superior.close();
    }
  });
}

afterEach(() => {
  cleanup();
  // Las pantallas con filtros en la URL la modifican; cada prueba parte de una URL limpia.
  window.history.replaceState(null, '', '/');
});
