import axios from "axios"

const URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : "");

const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export const AdminLogin = async ({ email, password }) => {
    const res = await axios.post(`${URL}/admin/login`, { email, password })
    return res.data
}

//For All Orders
export const OrderList = async (queryString) => {
    const res = await axios.get(`${URL}/allorders?${queryString}`, {
        headers: getAuthHeaders()
    })
    return res.data;
}

//To Add Product
export const AddProduct = async (formData) => {
    const res = await axios.post(`${URL}/addproduct`, formData, {
        headers: {
            ...getAuthHeaders()
        }
    })
    return res.data;
}

export const GetProduct = async (id) => {
    const res = await axios.get(`${URL}/product/${id}`)
    return res.data.singleProduct
}

export const UpdateProduct = async (id, formData) => {
    const res = await axios.put(`${URL}/admin/products/${id}`, formData, {
        headers: getAuthHeaders()
    })
    return res.data.product
}

//For All Products
export const AllProducts = async (queryString) => {
    const res = await axios.get(`${URL}/allproducts?${queryString}`)
    return res.data
}

//For Deletion
export const DeleteProduct = async (id) => {
    const res = await axios.delete(`${URL}/deleteproduct/${id}`)
    return res.data.product
}

//For Updating Order Status
export const UpdateOrderStatus = async (orderId, status) => {
    const res = await axios.patch(`${URL}/order/${orderId}/status`, { status }, {
        headers: getAuthHeaders()
    })
    return res.data;
}

export const UpdateOrderPaymentStatus = async (orderId, status) => {
    const res = await axios.patch(`${URL}/admin/orders/${orderId}/payment-status`, { status }, {
        headers: getAuthHeaders()
    })
    return res.data
}

export const AdminUpiOptions = async () => {
    const res = await axios.get(`${URL}/admin/payment-methods/upi`, {
        headers: getAuthHeaders()
    })
    return res.data.upiOptions
}

export const SaveAdminUpiOptions = async (upiOptions) => {
    const res = await axios.put(`${URL}/admin/payment-methods/upi`, { upiOptions }, {
        headers: getAuthHeaders()
    })
    return res.data.upiOptions
}

export const AdminSmtpSettings = async () => {
    const res = await axios.get(`${URL}/admin/settings/smtp`, {
        headers: getAuthHeaders()
    })
    return res.data.settings
}

export const SaveAdminSmtpSettings = async (settings) => {
    const res = await axios.put(`${URL}/admin/settings/smtp`, settings, {
        headers: getAuthHeaders()
    })
    return res.data.settings
}

export const AdminCorsSettings = async () => {
    const res = await axios.get(`${URL}/admin/settings/cors`, {
        headers: getAuthHeaders()
    })
    return res.data.origins
}

export const SaveAdminCorsSettings = async (origins) => {
    const res = await axios.put(`${URL}/admin/settings/cors`, { origins }, {
        headers: getAuthHeaders()
    })
    return res.data.origins
}

export const AddAdminProductReview = async (productId, review) => {
    const res = await axios.post(`${URL}/admin/products/${productId}/reviews`, review, {
        headers: getAuthHeaders()
    })
    return res.data
}

export const AdminUserList = async (queryString) => {
    const res = await axios.get(`${URL}/admin/users?${queryString}`, {
        headers: getAuthHeaders()
    })
    return res.data
}

export const ToggleUserRole = async (userId, role) => {
    const res = await axios.patch(`${URL}/admin/users/${userId}/role`, { role }, {
        headers: getAuthHeaders()
    })
    return res.data
}

export const DeleteUser = async (userId) => {
    const res = await axios.delete(`${URL}/admin/users/${userId}`, {
        headers: getAuthHeaders()
    })
    return res.data
}
