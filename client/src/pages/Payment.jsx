import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
    ArrowLeft,
    Banknote,
    CalendarDays,
    ChevronDown,
    CircleHelp,
    Clock3,
    CreditCard,
    ExternalLink,
    Gift,
    LockKeyhole,
    Plus,
    Smile
} from 'lucide-react'
import toast from 'react-hot-toast'
import { expireUpiPaymentRequest, fetchUpiOptions, SingleOrderApi, startUpiPaymentRequest, toPaymentGateway } from '../service/Api'
import './css/Payment.css'

const readStoredAmount = () => {
    try {
        return JSON.parse(sessionStorage.getItem('pendingPaymentAmount') || '{}')
    } catch {
        return {}
    }
}

const Payment = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { authenticated } = useSelector(state => state.user)
    const [expandedMethod, setExpandedMethod] = useState('')
    const [amountExpanded, setAmountExpanded] = useState(false)
    const [loadingPayment, setLoadingPayment] = useState(false)
    const [selectedUpi, setSelectedUpi] = useState('')
    const [upiId, setUpiId] = useState('')
    const [showUpiHelp, setShowUpiHelp] = useState(false)
    const [upiOptions, setUpiOptions] = useState([])
    const [loadingUpiOptions, setLoadingUpiOptions] = useState(false)
    const [upiOptionsError, setUpiOptionsError] = useState('')
    const [activePaymentRequest, setActivePaymentRequest] = useState(null)
    const [remainingSeconds, setRemainingSeconds] = useState(300)
    const [finalizingOrder, setFinalizingOrder] = useState(false)
    const expiryRequestInFlight = useRef(false)
    const orderId = location.state?.orderId || sessionStorage.getItem('pendingPaymentOrderId')
    const storedAmount = readStoredAmount()
    const totalCost = Number(location.state?.totalCost ?? storedAmount.totalCost ?? 0)
    const totalMrp = Number(location.state?.totalMrp ?? storedAmount.totalMrp ?? totalCost)
    const savings = Math.max(totalMrp - totalCost, 0)

    useEffect(() => {
        if (!authenticated) {
            navigate(`/product/${id}`, { replace: true })
        } else if (!orderId) {
            toast.error('Please continue from Order Summary')
            navigate(`/checkout/${id}/summary`, { replace: true })
        }
    }, [authenticated, id, navigate, orderId])

    useEffect(() => {
        if (!authenticated || !orderId) return undefined
        let cancelled = false
        setLoadingUpiOptions(true)
        fetchUpiOptions()
            .then(options => {
                if (!cancelled) setUpiOptions(options)
            })
            .catch(error => {
                if (!cancelled) setUpiOptionsError(error.response?.data?.message || 'UPI options could not be loaded')
            })
            .finally(() => {
                if (!cancelled) setLoadingUpiOptions(false)
            })
        return () => { cancelled = true }
    }, [authenticated, orderId])

    useEffect(() => {
        if (!authenticated || !orderId) return undefined
        let cancelled = false
        SingleOrderApi(orderId).then(async order => {
            if (cancelled) return
            const request = order.upiPaymentRequest
            if (request?.status === 'ACTIVE' && request.expiresAt) {
                if (new Date(request.expiresAt).getTime() <= Date.now()) {
                    try {
                        await expireUpiPaymentRequest(orderId)
                        if (!cancelled) navigate(`/order-success?orderId=${orderId}`, { replace: true })
                    } catch (error) {
                        if (!cancelled) toast.error(error.response?.data?.message || 'Could not finish the payment request')
                    }
                    return
                }
                setActivePaymentRequest(request)
            } else if (['AWAITING_REVIEW', 'CONFIRMED'].includes(request?.status)) {
                navigate(`/order-success?orderId=${orderId}`, { replace: true })
            }
        }).catch(() => {})
        return () => { cancelled = true }
    }, [authenticated, navigate, orderId])

    useEffect(() => {
        if (!activePaymentRequest?.expiresAt) return undefined
        let cancelled = false
        const finalizeOrder = async () => {
            if (expiryRequestInFlight.current) return
            expiryRequestInFlight.current = true
            setFinalizingOrder(true)
            try {
                await expireUpiPaymentRequest(orderId)
                sessionStorage.removeItem('pendingPaymentOrderId')
                sessionStorage.removeItem('pendingPaymentAmount')
                if (!cancelled) navigate(`/order-success?orderId=${orderId}`, { replace: true })
            } catch (error) {
                expiryRequestInFlight.current = false
                setFinalizingOrder(false)
                if (!cancelled) toast.error(error.response?.data?.message || 'Could not place the order yet')
            }
        }
        const updateCountdown = () => {
            const seconds = Math.max(0, Math.ceil((new Date(activePaymentRequest.expiresAt).getTime() - Date.now()) / 1000))
            setRemainingSeconds(seconds)
            if (seconds === 0) finalizeOrder()
        }
        updateCountdown()
        const interval = window.setInterval(updateCountdown, 1000)
        document.addEventListener('visibilitychange', updateCountdown)
        window.addEventListener('pageshow', updateCountdown)
        return () => {
            cancelled = true
            window.clearInterval(interval)
            document.removeEventListener('visibilitychange', updateCountdown)
            window.removeEventListener('pageshow', updateCountdown)
        }
    }, [activePaymentRequest?.expiresAt, navigate, orderId])

    const continueToGateway = async () => {
        if (!orderId) {
            toast.error('Order session expired. Please try again.')
            navigate(`/checkout/${id}/summary`)
            return
        }

        try {
            setLoadingPayment(true)
            const paymentUrl = await toPaymentGateway(orderId)
            window.location.href = paymentUrl
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not start payment')
            setLoadingPayment(false)
        }
    }

    const toggleMethod = (method) => {
        setExpandedMethod(current => current === method ? '' : method)
    }

    const buildUpiUrl = (upiIdValue, scheme = 'upi://pay') => {
        const query = new URLSearchParams({
            pa: upiIdValue,
            pn: 'Flipkart',
            am: totalCost.toFixed(2),
            cu: 'INR',
            tn: `Order ${orderId}`,
            tr: orderId
        })
        return `${scheme}?${query.toString()}`
    }

    const appSchemes = {
        'google-pay': 'tez://upi/pay',
        phonepe: 'phonepe://pay',
        paytm: 'paytmmp://pay',
        mobikwik: 'mobikwik://upi/pay',
        custom: 'upi://pay'
    }

    const openUpiApp = (request) => {
        window.location.href = buildUpiUrl(request.upiId, appSchemes[request.provider] || 'upi://pay')
    }

    const beginUpiPayment = async (requestBody, selectedValue) => {
        try {
            setLoadingPayment(true)
            const request = await startUpiPaymentRequest(orderId, requestBody)
            expiryRequestInFlight.current = false
            setFinalizingOrder(false)
            setSelectedUpi(selectedValue)
            setActivePaymentRequest(request)
            window.setTimeout(() => openUpiApp(request), 350)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not start the UPI payment request')
        } finally {
            setLoadingPayment(false)
        }
    }

    const openUpiProvider = (option) => beginUpiPayment({ optionId: option.id }, option.id)

    const openCustomUpi = () => {
        if (!/^[a-z0-9][a-z0-9._-]{0,99}@[a-z0-9][a-z0-9.-]{0,29}$/i.test(upiId.trim())) {
            toast.error('Enter a valid UPI ID')
            return
        }
        beginUpiPayment({ customUpiId: upiId.trim() }, 'new-upi')
    }

    if (!authenticated || !orderId) return null

    return (
        <main className="payment-page">
            <header className="payment-header">
                <button type="button" aria-label="Back to order summary" onClick={() => navigate(`/checkout/${id}/summary`)}>
                    <ArrowLeft />
                </button>
                <div className="payment-heading">
                    <span>Step 3 of 3</span>
                    <h1>Payments</h1>
                </div>
                <span className="payment-secure"><LockKeyhole /> 100% Secure</span>
            </header>

            <section className={`payment-total ${amountExpanded ? 'expanded' : ''}`}>
                <button type="button" onClick={() => setAmountExpanded(value => !value)} aria-expanded={amountExpanded}>
                    <span>Total Amount <ChevronDown /></span>
                    <strong>₹{totalCost.toLocaleString('en-IN')}</strong>
                </button>
                {amountExpanded && <div className="payment-amount-details">
                    <p><span>Price ({totalMrp === totalCost ? '1 item' : '1 item'})</span><span>₹{totalMrp.toLocaleString('en-IN')}</span></p>
                    <p><span>Discount</span><span className="payment-green">− ₹{savings.toLocaleString('en-IN')}</span></p>
                    <p><span>Delivery Charges</span><span className="payment-green">Free</span></p>
                    <p className="payment-amount-final"><strong>Payable Amount</strong><strong>₹{totalCost.toLocaleString('en-IN')}</strong></p>
                </div>}
            </section>

            <section className="payment-cashback">
                <div>
                    <strong>5% Cashback</strong>
                    <span>Claim now with payment offers</span>
                </div>
                <span className="payment-cashback-brands" aria-label="Bank offers available">
                    <b className="payment-bank-mark">S</b>
                    <b className="payment-axis-mark">A</b>
                </span>
            </section>

            <section className="payment-methods" aria-label="Payment methods">
                <article className={`payment-method ${expandedMethod === 'upi' ? 'open' : ''}`}>
                    <button type="button" className="payment-method-toggle" onClick={() => toggleMethod('upi')} aria-expanded={expandedMethod === 'upi'}>
                        <span className="payment-method-icon payment-upi-mark" aria-hidden="true">UPI</span>
                        <span className="payment-method-copy"><strong>UPI</strong><small>Pay by any UPI app</small></span>
                        <ChevronDown className="payment-method-chevron" />
                    </button>
                    {expandedMethod === 'upi' && <div className="payment-method-details">
                        {loadingUpiOptions && <p className="payment-upi-status">Loading UPI apps…</p>}
                        {!loadingUpiOptions && upiOptionsError && <p className="payment-upi-status error">{upiOptionsError}</p>}
                        {!loadingUpiOptions && !upiOptionsError && upiOptions.length === 0 && <p className="payment-upi-status">No UPI apps are configured yet.</p>}
                        <div className="payment-upi-options" role="radiogroup" aria-label="Choose a UPI payment option">
                            {upiOptions.map(option => {
                                const brandClass = {
                                    'google-pay': 'payment-google-logo',
                                    phonepe: 'payment-phonepe-logo',
                                    paytm: 'payment-paytm-logo',
                                    mobikwik: 'payment-mobikwik-logo'
                                }[option.provider]
                                const brandMark = { 'google-pay': 'G', phonepe: 'पे', paytm: 'P', mobikwik: 'M' }[option.provider]
                                return <label className="payment-upi-option" key={option.id}>
                                    <input type="radio" name="upi-option" value={option.id} checked={selectedUpi === option.id} onChange={() => openUpiProvider(option)} />
                                    <span>{option.label}</span>
                                    <span className={brandClass} aria-hidden="true">{brandMark}</span>
                                </label>
                            })}
                            <div className="payment-upi-option payment-upi-new-option">
                                <label>
                                    <input type="radio" name="upi-option" value="new-upi" checked={selectedUpi === 'new-upi'} onChange={() => setSelectedUpi('new-upi')} />
                                    <span>Add new UPI ID</span>
                                </label>
                                <button type="button" onClick={() => setShowUpiHelp(value => !value)}>How to find?</button>
                            </div>
                        </div>
                        {selectedUpi === 'new-upi' && <label className="payment-upi-id-field">Enter UPI ID<input type="text" value={upiId} onChange={event => setUpiId(event.target.value)} placeholder="name@bank" /></label>}
                        {showUpiHelp && <p className="payment-upi-help">Open your UPI app and find your UPI ID in Profile or Payment settings.</p>}
                        {selectedUpi === 'new-upi' && <button className="payment-continue-button" type="button" onClick={openCustomUpi} disabled={loadingPayment}>{loadingPayment ? 'Starting payment…' : 'Pay with UPI'}</button>}
                    </div>}
                </article>

                <article className={`payment-method ${expandedMethod === 'card' ? 'open' : ''}`}>
                    <button type="button" className="payment-method-toggle" onClick={() => toggleMethod('card')} aria-expanded={expandedMethod === 'card'}>
                        <CreditCard className="payment-method-icon" />
                        <span className="payment-method-copy">
                            <strong>Credit / Debit / ATM Card</strong>
                            <small>Add and secure cards as per RBI guidelines</small>
                            <em>Get upto 5% cashback · 2 offers available</em>
                        </span>
                        <ChevronDown className="payment-method-chevron" />
                    </button>
                    {expandedMethod === 'card' && <div className="payment-method-details">
                        <label>Card number<input type="text" inputMode="numeric" placeholder="0000 0000 0000 0000" /></label>
                        <div className="payment-card-fields">
                            <label>Expiry date<input type="text" placeholder="MM / YY" /></label>
                            <label>CVV<input type="password" inputMode="numeric" placeholder="CVV" /></label>
                        </div>
                        <button className="payment-continue-button" type="button" onClick={continueToGateway} disabled={loadingPayment}>
                            {loadingPayment ? 'Opening secure payment…' : 'Continue'}
                        </button>
                    </div>}
                </article>

                <article className={`payment-method ${expandedMethod === 'cod' ? 'open' : ''}`}>
                    <button type="button" className="payment-method-toggle single-line" onClick={() => toggleMethod('cod')} aria-expanded={expandedMethod === 'cod'}>
                        <Banknote className="payment-method-icon" />
                        <span className="payment-method-copy"><strong>Cash on Delivery</strong></span>
                        <ChevronDown className="payment-method-chevron" />
                    </button>
                    {expandedMethod === 'cod' && <div className="payment-method-details"><p>Cash on Delivery is available on eligible orders. Payment options are confirmed at delivery.</p></div>}
                </article>

                <article className={`payment-method payment-gift-card ${expandedMethod === 'gift' ? 'open' : ''}`}>
                    <button type="button" className="payment-method-toggle single-line" onClick={() => toggleMethod('gift')} aria-expanded={expandedMethod === 'gift'}>
                        <Gift className="payment-method-icon" />
                        <span className="payment-method-copy"><strong>Have a Flipkart Gift Card?</strong></span>
                        <Plus className="payment-gift-plus" />
                    </button>
                    {expandedMethod === 'gift' && <div className="payment-method-details">
                        <label>Gift card number<input type="text" placeholder="Enter gift card number" /></label>
                        <button className="payment-continue-button" type="button" onClick={() => toast('Gift card payments are not available yet')}>Apply</button>
                    </div>}
                </article>

                <article className="payment-method payment-unavailable" aria-disabled="true">
                    <div className="payment-method-toggle single-line">
                        <CalendarDays className="payment-method-icon" />
                        <span className="payment-method-copy"><strong>EMI</strong></span>
                        <span className="payment-unavailable-label">Unavailable <CircleHelp /></span>
                    </div>
                </article>
            </section>

            <footer className="payment-footer-note">
                <strong>35 Crore happy customers and counting!</strong>
                <Smile aria-hidden="true" />
            </footer>

            {activePaymentRequest && <div className="upi-timer-overlay" role="presentation">
                <section className="upi-timer-modal" role="dialog" aria-modal="true" aria-labelledby="upi-timer-title">
                    <span className="upi-timer-icon"><Clock3 size={24} /></span>
                    <p className="upi-timer-eyebrow">UPI payment request</p>
                    <h2 id="upi-timer-title">Complete payment in {activePaymentRequest.label}</h2>
                    <p className="upi-timer-description">The payment app may open separately. Return here whenever you’re ready; the timer stays attached to your order.</p>
                    <strong className="upi-timer-countdown" aria-live="polite">{String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:{String(remainingSeconds % 60).padStart(2, '0')}</strong>
                    <button className="upi-timer-open-app" type="button" onClick={() => openUpiApp(activePaymentRequest)}>
                        Open {activePaymentRequest.label} again <ExternalLink size={16} />
                    </button>
                    <p className="upi-timer-note">When the timer ends, your order is placed. Payment stays pending until the store verifies it.</p>
                    {finalizingOrder && <p className="upi-timer-finalizing" role="status">Placing your order…</p>}
                </section>
            </div>}
        </main>
    )
}

export default Payment