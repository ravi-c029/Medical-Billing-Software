import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

import { Dashboard } from './pages/Dashboard';
import { NewInvoice } from './pages/NewInvoice';
import { InvoiceHistory } from './pages/InvoiceHistory';
import { ProductManager } from './pages/ProductManager';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="new-invoice" element={<NewInvoice />} />
          <Route path="history" element={<InvoiceHistory />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
