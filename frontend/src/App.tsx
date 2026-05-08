import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserProvider } from "./contexts/UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthPage = lazy(() => import("./pages/auth/AuthPage"));
const Layout = lazy(() => import("./layouts/Layout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Sales = lazy(() => import("./pages/Sales"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFoundPage"));
const BusinessSettings = lazy(() => import("./pages/Business"));
const Finances = lazy(() => import("./pages/Finances"));
const FinancesDetails = lazy(() => import("./pages/FinancesDetails"));
const SaleDetail = lazy(() => import("./pages/SaleDetail"));
const BannedPage = lazy(() => import("./pages/BanPage"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <UserProvider>
                  <Layout />
                </UserProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="sales" element={<Sales />} />
            <Route path="profile" element={<Profile />} />
            <Route path="business" element={<BusinessSettings />} />
            <Route path="finances" element={<Finances />} />
            <Route path="finances/details" element={<FinancesDetails />} />
            <Route path="/sales/:id" element={<SaleDetail />} />
          </Route>
          <Route path="/banned" element={<BannedPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </BrowserRouter>
  );
}

export default App;
