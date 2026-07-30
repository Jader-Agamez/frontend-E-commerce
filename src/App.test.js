import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { authAPI, productsAPI, categoriesAPI } from './services/api';

jest.mock('./services/api', () => ({
  authAPI: {
    login: jest.fn(),
  },
  productsAPI: {
    getAll: jest.fn(),
  },
  categoriesAPI: {
    getAll: jest.fn(),
  },
  default: {},
}));

test('logs in and shows the home page', async () => {
  authAPI.login.mockResolvedValue({
    data: {
      token: 'fake-token',
      user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'customer' },
    },
  });
  productsAPI.getAll.mockResolvedValue({
    data: {
      products: [{ id: 1, name: 'Test Product', price: 25.5, image: 'x', description: 'desc', stock: 10 }],
      total: 1,
    },
  });
  categoriesAPI.getAll.mockResolvedValue({ data: [] });

  window.history.pushState({}, '', '/login');
  render(<App />);

  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/contraseña/i), 'password123');
  await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

  await waitFor(() => {
    expect(screen.getByText(/descubre los mejores productos/i)).toBeInTheDocument();
  });
});
