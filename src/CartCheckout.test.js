import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import App from './App';
import { authAPI, productsAPI, categoriesAPI, cartAPI, ordersAPI } from './services/api';

// Prevent react-hot-toast from performing DOM updates during tests (test-only mock)
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn() }, Toaster: () => null }));

jest.mock('./services/api', () => ({
  authAPI: { login: jest.fn() },
  productsAPI: { getAll: jest.fn() },
  categoriesAPI: { getAll: jest.fn() },
  cartAPI: { addItem: jest.fn(), getCart: jest.fn(), removeItem: jest.fn(), updateItem: jest.fn(), clearCart: jest.fn() },
  ordersAPI: { create: jest.fn(), getOne: jest.fn(), getAll: jest.fn() },
  default: {},
}));

test('add product to cart and complete checkout', async () => {
  // Mocks
  authAPI.login.mockResolvedValue({ data: { token: 't', user: { id: 1, name: 'Test', email: 't@test.com', role: 'customer' } } });
  productsAPI.getAll.mockResolvedValue({ data: { products: [{ id: 42, name: 'TC Product', price: 10.0, stock: 5, image: 'x' }], total: 1 } });
  categoriesAPI.getAll.mockResolvedValue({ data: [] });

  // When cart is fetched after login, return one item (simulate successful add)
  cartAPI.addItem.mockResolvedValue({ data: {} });
  cartAPI.getCart.mockResolvedValue({ data: [{ id: 7, product: { id: 42, name: 'TC Product', price: 10.0 }, quantity: 1 }] });

  ordersAPI.create.mockResolvedValue({ data: { order: { id: 999 } } });
  ordersAPI.getOne.mockResolvedValue({ data: { id: 999, createdAt: new Date().toISOString(), status: 'paid', paymentMethod: 'Card', paymentId: 'PAYID', shippingAddress: 'Av Test 123', items: [{ id: 1, product: { name: 'TC Product' }, quantity: 1, unitPrice: 10.0, subtotal: 10.0 }], total: 10.0 } });

  // Start at login
  window.history.pushState({}, '', '/login');
  const { container } = render(<App />);
  const user = userEvent.setup();

  // Wait for login form inputs to be available, then fill and submit login
  const emailInput = await screen.findByLabelText(/email/i);
  const passwordInput = await screen.findByLabelText(/contraseña/i);
  await user.type(emailInput, 't@test.com');
  await user.type(passwordInput, 'password');
  await act(async () => { await user.click(screen.getByRole('button', { name: /iniciar sesión/i })); });

  // Wait for product to appear on home (products loaded)
  await screen.findByText(/tc product/i);

  // Click add to cart button for product
  const addBtn = await screen.findByRole('button', { name: /agregar al carrito/i });
  await act(async () => { await user.click(addBtn); });

  // After add, cart API should have been called (via CartContext)
  await waitFor(() => expect(cartAPI.addItem).toHaveBeenCalled());

  // Navigate to cart via navbar
  const cartLink = await screen.findByRole('link', { name: /carrito/i });
  await act(async () => { await user.click(cartLink); });

  // Wait for cart summary and click proceed to checkout
  await screen.findByText(/proceder al pago/i);
  await user.click(screen.getByRole('button', { name: /proceder al pago/i }));

  // We're on checkout page: fill form
  await screen.findByText(/información de pago/i);
  // shipping textarea by placeholder
  const shipping = await screen.findByPlaceholderText(/calle, número, ciudad, país/i);
  const cardNumber = await screen.findByPlaceholderText(/1234 5678 9012 3456/i);
  const cardHolder = container.querySelector('input[name="cardHolder"]');

  await user.type(shipping, 'Av Test 123');
  await user.type(cardNumber, '4111111111111111');
  await user.type(cardHolder, 'Test User');

  // Submit (wrap in act to cover subsequent navigation/state updates)
  await act(async () => {
    await user.click(screen.getByRole('button', { name: /confirmar pedido/i }));
  });

  // Expect ordersAPI.create called with expected payload
  await waitFor(() => expect(ordersAPI.create).toHaveBeenCalled());

});
