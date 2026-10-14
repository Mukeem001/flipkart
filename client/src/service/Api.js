import axiosInstance from "./AxiosInstance";
import { firebaseSendPhoneOtp, firebaseVerifyPhoneOtp } from "./firebaseAuth";


// Order Placement API
export const placeOrderApi = async (cartItems, totalPrice) => {
    const res = await axiosInstance.post(`/order`, { cartItems, totalPrice });
    return res.data.orderId
}

// Payment Gateway page
export const toPaymentGateway = async (orderId) => {
    const res = await axiosInstance.post(`/payment/${orderId}`)
    const travelLink = res.data.payment_link_url
    return travelLink
}

export const fetchUpiOptions = async () => {
    const res = await axiosInstance.get('/payment-methods/upi')
    return res.data.upiOptions
}

// Customer Orders API
export const OrderApi = async () => {
    const res = await axiosInstance.get(`/customerorders`)
    return res.data.orders
}

//Get Single Order
export const SingleOrderApi = async (id) => {
    const res = await axiosInstance.get(`/singleOrder/${id}`)
    return res.data.order
}

export const startUpiPaymentRequest = async (orderId, request) => {
    const { data } = await axiosInstance.post(`/order/${orderId}/upi-payment-request`, request)
    return data.paymentRequest
}

export const expireUpiPaymentRequest = async (orderId) => {
    const { data } = await axiosInstance.post(`/order/${orderId}/upi-payment-expired`)
    return data
}

//Send OTP
export const SendOtp = async (identifier) => {
    const payload = typeof identifier === 'string' ? { email: identifier } : identifier
    const res = await axiosInstance.post(`/send-otp`, payload)
    return res.data.message
}

export const SearchProducts = async (query) => {
    const res = await axiosInstance.get(`/allproducts?search=${encodeURIComponent(query)}`)
    return res.data.allProducts || []
}

export const SendSignupOtp = async ({ email, username, phone }) => {
    const { data } = await axiosInstance.post('/signup/send-otp', { email, username, phone })
    return data.message
}

export const SendFirebaseOtp = async (identifier) => {
    const firebaseEnabled = !!import.meta.env.VITE_FIREBASE_API_KEY
    const payload = typeof identifier === 'string' ? { email: identifier } : identifier

    if (!firebaseEnabled) {
        await SendOtp(payload)
        return { mode: 'backend' }
    }

    if (payload.phone) {
        const confirmation = await firebaseSendPhoneOtp(payload.phone)
        return { mode: 'phone', confirmationResult: confirmation }
    }

    await SendOtp(payload)
    return { mode: 'backend' }
}

export const VerifyFirebaseOtp = async (confirmationResult, otp) => {
    const firebaseEnabled = !!import.meta.env.VITE_FIREBASE_API_KEY
    if (!firebaseEnabled || !confirmationResult) {
        return null
    }

    return firebaseVerifyPhoneOtp(confirmationResult, otp)
}

//Save Review
export const SubmitReview = async (userReview, id) => {
    const res = await axiosInstance.post(`/review/${id}`, {
        rating: userReview.rating,
        title: userReview.title,
        description: userReview.description
    })
    return res.data.message
}

//Edit Review
export const SubmitReviewChanges = async (userReview, id) => {
    const res = await axiosInstance.post(`/review/update/${id}`, {
        rating: userReview.rating,
        title: userReview.title,
        description: userReview.description,
    })
    return res.data.message
}

//Delete Review
export const DeleteReview = async (id) => {
    const res = await axiosInstance.post(`/review/delete/${id}`)
    return res.data.message
}