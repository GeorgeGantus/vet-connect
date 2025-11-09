import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyCatalogsPage from './pages/MyCatalogsPage';
import AddProductPage from './pages/AddProductPage';
import ViewCatalogPage from './pages/ViewCatalogPage';
import CatalogEventHistoryPage from './pages/CatalogEventHistoryPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import VetHomePage from './pages/VetHomePage';
import PublicCatalogViewPage from './pages/PublicCatalogViewPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ClientsPage from './pages/ClientsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <div className="App bg-slate-50 min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Routes for Vendors */}
          <Route element={<ProtectedRoute roles={['vendor']} />}>
            <Route path="/dashboard" element={<VendorDashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/my-catalogs" element={<MyCatalogsPage />} />
            <Route path="/my-catalogs/:catalogId/products" element={<AddProductPage />} />
            <Route path="/my-catalogs/:catalogId/view" element={<ViewCatalogPage />} />
            <Route path="/my-catalogs/:catalogId/events" element={<CatalogEventHistoryPage />} />
          </Route>
          {/* Routes for Veterinarians */}
          <Route element={<ProtectedRoute roles={['veterinarian']} />}>
            <Route path="/vet-home" element={<VetHomePage />} />
          </Route>
          {/* Routes for any authenticated user */}
          <Route element={<ProtectedRoute roles={['vendor', 'veterinarian']} />}>
            <Route path="/catalog/:accessCode" element={<PublicCatalogViewPage />} />
          </Route>
          {/* This is a catch-all route for 404 pages */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
