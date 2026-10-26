import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import CakeOrderPage from './pages/CakeOrderPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminGalleryPage from './pages/admin/AdminGalleryPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminPerfumesPage from './pages/admin/AdminPerfumesPage';
import AdminCalendarPage from './pages/admin/AdminCalendarPage';
import AdminDeliveryPage from './pages/admin/AdminDeliveryPage';
import PerfumePage from './pages/PerfumePage';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />
        <Route
          path="/gallery"
          element={
            <PublicLayout>
              <GalleryPage />
            </PublicLayout>
          }
        />
        <Route
          path="/order"
          element={
            <PublicLayout>
              <CakeOrderPage />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <AboutPage />
            </PublicLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout>
              <ContactPage />
            </PublicLayout>
          }
        />
        <Route
          path="/perfume"
          element={
            <PublicLayout>
              <PerfumePage />
            </PublicLayout>
          }
        />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
          <Route path="messages" element={<AdminMessagesPage />} />
          <Route path="perfumes" element={<AdminPerfumesPage />} />
          <Route path="calendar" element={<AdminCalendarPage />} />
          <Route path="delivery" element={<AdminDeliveryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
