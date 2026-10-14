import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Check, ChevronRight, CreditCard, Info, PackageCheck, Truck } from 'lucide-react'
import { fetchProductDetail } from '../redux/features/ProductSlice'
import { placeOrderApi } from '../service/Api'
import toast from 'react-hot-toast'
import './css/OrderSummary.css'

const OrderSummary = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const { product, loadingProduct } = useSelector(state => state.products)
    const { user, authenticated } = useSelector(state => state.user)
    const [loadingPayment, setLoadingPayment] = useState(false)
    const { selectedSize, selectedVariant } = location.state || {}

    useEffect(() => {
        if (product?._id !== id) dispatch(fetchProductDetail(id))
    }, [dispatch, id, product?._id])

    useEffect(() => {
        if (!authenticated) navigate(`/product/${id}`, { replace: true })
    }, [authenticated, id, navigate])

    if (loadingProduct || product?._id !== id || !authenticated) {
        return <div className="order-summary-loading"><span className="spinner-border text-primary" role="status" /></div>
    }

    const productCost = product.price?.cost ?? 0
    const productMrp = product.price?.mrp ?? productCost
    const savings = Math.max(productMrp - productCost, 0)
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + 5)
    const deliveryDateText = deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })
    const variantName = ['White', 'White/Grey', 'White/Black', 'White/Blue'][selectedVariant ?? 2]

    const continueToPayment = async () => {
        try {
            setLoadingPayment(true)
            const orderId = await placeOrderApi([{ ...product, quantity: 1 }], productCost)
            sessionStorage.setItem('pendingPaymentOrderId', orderId)
            sessionStorage.setItem('pendingPaymentAmount', JSON.stringify({ totalCost: productCost, totalMrp: productMrp }))
            navigate(`/checkout/${id}/payment`, {
                state: {
                    orderId,
                    totalCost: productCost,
                    totalMrp: productMrp
                }
            })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not continue to payment')
            setLoadingPayment(false)
        }
    }

    return (
        <main className="order-summary-page">
            <header className="order-summary-header">
                <button type="button" aria-label="Back to product" onClick={() => navigate(`/product/${id}`)}><ArrowLeft size={23} /></button>
                <h1>Order Summary</h1>
            </header>

            <section className="checkout-steps" aria-label="Checkout progress">
                <div className="checkout-step completed"><span><Check size={15} /></span><small>Address</small></div>
                <i />
                <div className="checkout-step active"><span>2</span><small>Order Summary</small></div>
                <i />
                <div className="checkout-step"><span>3</span><small>Payment</small></div>
            </section>

            <section className="checkout-address-section">
                <div className="checkout-address-title">
                    <strong>Deliver to:</strong>
                    <button type="button" onClick={() => toast('Saved address editing is not available yet')}>Change</button>
                </div>
                <strong className="checkout-customer-name">{user?.name || 'Customer'} <small>HOME</small></strong>
                <p>{user?.email || 'Email not available'}</p>
                <p>{user?.phone || user?.mobile || 'Phone not available'}</p>
                <small className="address-notice">No saved street address is available on this account.</small>
            </section>

            <section className="checkout-product-section">
                <span className="checkout-sale-label">Big Billion Days Price</span>
                <div className="checkout-product-row">
                    <img src={product.detailUrl} alt={product.title?.shortTitle || 'Product'} />
                    <div className="checkout-product-info">
                        <h2>{product.title?.longTitle || product.title?.shortTitle}</h2>
                        {selectedSize && <p>Size: {selectedSize}{selectedVariant !== undefined && /shoe|sneaker|footwear|jean|trouser|pant/i.test(`${product.category || ''} ${product.title?.shortTitle || ''}`) ? ` · ${variantName}` : ''}</p>}
                        <span className="checkout-product-rating">★★★★☆ <b>{Number(product.averageRating || 4.1).toFixed(1)}</b></span>
                        <div className="checkout-product-price"><span>↓{product.price?.discount || '0%'} </span><s>₹{productMrp.toLocaleString('en-IN')}</s><strong>₹{productCost.toLocaleString('en-IN')}</strong></div>
                    </div>
                </div>
                <div className="checkout-delivery-row"><Truck size={19} /><strong>Delivery by {deliveryDateText}</strong></div>
            </section>

            <section className="open-box-section">
                <h2><PackageCheck size={22} /> Rest assured with Open Box Delivery</h2>
                <p>Check the product for damage or missing items when your package arrives.</p>
                <a href="#open-box">Why? <ChevronRight size={14} /></a>
            </section>

            <section className="checkout-payment-note"><CreditCard size={17} /> Secure payment through our payment partner <Info size={15} /></section>

            <footer className="order-summary-footer">
                <div className="checkout-total">
                    <s>₹{productMrp.toLocaleString('en-IN')}</s>
                    <strong>₹{productCost.toLocaleString('en-IN')}</strong>
                    <small><span>Save ₹{savings.toLocaleString('en-IN')}</span> on this order</small>
                </div>
                <button type="button" onClick={continueToPayment} disabled={loadingPayment}>
                    {loadingPayment ? <span className="spinner-border spinner-border-sm" role="status" /> : 'Continue'}
                </button>
            </footer>
        </main>
    )
}

export default OrderSummary
