import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

Object.defineProperty(HTMLElement.prototype, 'innerText', {
  get() { return this.textContent; },
  set(v) { this.textContent = v; },
  configurable: true
});

global.fetch = jest.fn();

describe('App Component Unit Tests', () => {

  beforeEach(() => {
    fetch.mockClear();
    document.body.innerHTML = '';
  });

  test('getBooksNominalTest: affiche les titres des livres après clic', async () => {
    const mockBooks = [{ id: 1, titre: 'Livre Test', auteur: 'Auteur', price: 10 }];

    fetch.mockResolvedValueOnce({
      json: async () => mockBooks,
    });

    render(<App />);

    const button = screen.getByText(/Lister les livres intelligent/i);
    fireEvent.click(button);

    // On utilise une regex pour être plus souple sur la recherche du texte
    await waitFor(() => {
      expect(screen.getByText(/Livre Test/i)).toBeInTheDocument();
    });
  });

  test('getBooksExceptionTest: affiche un message si aucun livre n\'est retourné', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => [], // Simule une liste vide
    });

    render(<App />);

    const button = screen.getByText(/Lister les livres intelligent/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Pas de livre dispo gros nul/i)).toBeInTheDocument();
    });
  });

  test('fetchFailureTest: alerte l\'utilisateur en cas de plantage réseau', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    fetch.mockRejectedValueOnce(new Error("API Down"));

    render(<App />);

    const button = screen.getByText(/Lister les livres intelligent/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("Erreur lors de l'appel au back end"));
    });
    alertMock.mockRestore();
  });
});