import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/Dashboard'
import AddProducts from './pages/AddProducts';
import EditProduct from './pages/EditProduct';
import Orders from './pages/Orders';
import Products from './pages/Products';
import PaymentSettings from './pages/PaymentSettings';
import Users from './pages/Users';
import Reviews from './pages/Reviews';
import Login from './pages/Login';

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken')
  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
            <Route path='/' element={<Dashboard />} />
            <Route path='/products' element={<Products />} />
            <Route path='/add-products' element={<AddProducts />} />
            <Route path='/edit-products/:id' element={<EditProduct />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/users' element={<Users />} />
            <Route path='/payment-settings' element={<PaymentSettings />} />
            <Route path='/reviews' element={<Reviews />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App