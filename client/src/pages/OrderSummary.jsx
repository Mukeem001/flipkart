import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, BriefcaseBusiness, Check, ChevronRight, CreditCard, Home, Info, MoreHorizontal, PackageCheck, Plus, Search, Truck, X } from 'lucide-react'
import { fetchProductDetail } from '../redux/features/ProductSlice'
import { updateDeliveryAddresses } from '../redux/features/UserSlice'
import { useAppBack } from '../hooks/useAppBack'
import { placeOrderApi, saveDeliveryAddress, selectDeliveryAddress } from '../service/Api'
import toast from 'react-hot-toast'
import './css/OrderSummary.css'

const emptyAddress = (user) => ({
    fullName: user?.name || '',
    phone: user?.phone || '',
    alternatePhone: '',
    flat: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Home'
})

const formatAddress = (address) => [address.flat, address.area, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(', ')

const OrderSummary = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const goBack = useAppBack(`/product/${id}`)
    const location = useLocation()
    const dispatch = useDispatch()
    const { product, loadingProduct } = useSelector(state => state.products)
    const { user, authenticated } = useSelector(state => state.user)
    const [loadingPayment, setLoadingPayment] = useState(false)
    const [savedAddresses, setSavedAddresses] = useState(user?.addresses || [])
    const [selectedAddressId, setSelectedAddressId] = useState(user?.selectedAddressId || user?.addresses?.[0]?._id || '')
    const [showAddressPicker, setShowAddressPicker] = useState(false)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [savingAddress, setSavingAddress] = useState(false)
    const [addressForm, setAddressForm] = useState(() => emptyAddress(user))
    const { selectedSize, selectedVariant } = location.state || {}

    useEffect(() => {
        const addresses = user?.addresses || []
        setSavedAddresses(addresses)
        setSelectedAddressId(user?.selectedAddressId || addresses[0]?._id || '')
        setAddressForm(current => ({ ...current, fullName: current.fullName || user?.name || '', phone: current.phone || user?.phone || '' }))
    }, [user?.addresses, user?.name, user?.phone, user?.selectedAddressId])

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
    const selectedAddress = savedAddresses.find(address => String(address._id) === String(selectedAddressId))

    const closeAddressOverlays = () => {
        setShowAddressPicker(false)
        setShowAddressForm(false)
    }

    const chooseAddress = async (addressId) => {
        try {
            await selectDeliveryAddress(addressId)
            dispatch(updateDeliveryAddresses({ addresses: savedAddresses, selectedAddressId: addressId }))
            setSelectedAddressId(addressId)
            setShowAddressPicker(false)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not select this address')
        }
    }

    const submitAddress = async (event) => {
        event.preventDefault()
        try {
            setSavingAddress(true)
            const result = await saveDeliveryAddress(addressForm)
            if (!result?.success || !result.address?._id) {
                throw new Error(result?.message || 'Address could not be saved')
            }
            const addressId = String(result.selectedAddressId || result.address._id)
            const addresses = [
                ...savedAddresses.filter(address => String(address._id) !== String(result.address._id)),
                result.address
            ]
            setSavedAddresses(addresses)
            dispatch(updateDeliveryAddresses({ addresses, selectedAddressId: addressId }))
            setSelectedAddressId(addressId)
            setShowAddressForm(false)
            setShowAddressPicker(false)
            setAddressForm(emptyAddress(user))
            toast.success('Delivery address saved')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not save this address')
        } finally {
            setSavingAddress(false)
        }
    }

    const continueToPayment = async () => {
        if (!selectedAddress) {
            setShowAddressForm(true)
            toast.error('Please add a delivery address to continue')
            return
        }
        try {
            setLoadingPayment(true)
            const orderId = await placeOrderApi([{ ...product, quantity: 1 }], productCost, selectedAddress._id)
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
            toast.error(error.response?.data?.message || error.message || 'Could not continue to payment')
            setLoadingPayment(false)
        }
    }

    return (
        <main className="order-summary-page">
            <header className="order-summary-header">
                <button type="button" aria-label="Back to product" onClick={goBack}><ArrowLeft size={23} /></button>
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
                    <button type="button" onClick={() => setShowAddressPicker(true)}>Change</button>
                </div>
                {selectedAddress ? (
                    <>
                        <strong className="checkout-customer-name">{selectedAddress.fullName} <small>{(selectedAddress.type || 'Home').toUpperCase()}</small></strong>
                        <p>{formatAddress(selectedAddress)}</p>
                        <p>{selectedAddress.phone}{selectedAddress.alternatePhone ? ` · ${selectedAddress.alternatePhone}` : ''}</p>
                    </>
                ) : (
                    <div className="checkout-address-empty">
                        <span>No delivery address saved yet.</span>
                        <button type="button" onClick={() => setShowAddressForm(true)}><Plus size={16} /> Add address</button>
                    </div>
                )}
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

            {showAddressPicker && <div className="address-overlay" role="presentation" onClick={closeAddressOverlays}>
                <section className="address-picker-panel" role="dialog" aria-modal="true" aria-labelledby="address-picker-title" onClick={event => event.stopPropagation()}>
                    <span className="address-sheet-handle" />
                    <header className="address-picker-header">
                        <h2 id="address-picker-title">Select delivery address</h2>
                        <button type="button" aria-label="Close address selection" onClick={closeAddressOverlays}><X size={28} /></button>
                    </header>
                    <div className="address-picker-rule" />
                    <div className="address-picker-subheader">
                        <h3>Saved addresses</h3>
                        <button type="button" onClick={() => { setAddressForm(emptyAddress(user)); setShowAddressForm(true) }}><Plus size={22} /> Add New</button>
                    </div>
                    {savedAddresses.length ? <div className="saved-address-list">
                        {savedAddresses.map(address => {
                            const isSelected = String(address._id) === String(selectedAddressId)
                            return <article className={`saved-address-item ${isSelected ? 'selected' : ''}`} key={address._id}>
                                <button className="saved-address-choice" type="button" onClick={() => chooseAddress(address._id)}>
                                    {address.type === 'Work' ? <BriefcaseBusiness size={24} /> : <Home size={24} />}
                                    <span className="saved-address-copy">
                                        <strong>{address.fullName} {isSelected && <small>Selected</small>}</strong>
                                        <span>{formatAddress(address)}</span>
                                        <span>{address.phone}</span>
                                    </span>
                                </button>
                                <MoreHorizontal className="saved-address-more" size={24} aria-hidden="true" />
                            </article>
                        })}
                    </div> : <p className="address-list-empty">You haven’t saved any delivery addresses.</p>}
                </section>
            </div>}

            {showAddressForm && <div className="address-overlay address-form-overlay" role="presentation" onClick={closeAddressOverlays}>
                <div className="address-add-background" aria-hidden="true">
                    <div className="address-location-search"><Search size={20} /><span>Search by area, name, street.</span></div>
                </div>
                <section className="address-form-panel" role="dialog" aria-modal="true" aria-labelledby="address-form-title" onClick={event => event.stopPropagation()}>
                    <header className="address-form-header">
                        <button type="button" aria-label="Back to saved addresses" onClick={() => { setShowAddressForm(false); setShowAddressPicker(true) }}><ArrowLeft size={25} /></button>
                        <h2 id="address-form-title">Add new address</h2>
                        <button type="button" aria-label="Close address form" onClick={closeAddressOverlays}><X size={26} /></button>
                    </header>
                    <form className="address-form" onSubmit={submitAddress}>
                        <h3>Deliver To</h3>
                        <p className="address-form-notice"><Info size={19} /> Ensure your address details are accurate for a smooth delivery experience</p>
                        <label>Flat/House/building name *
                            <input required maxLength={120} value={addressForm.flat} onChange={event => setAddressForm(current => ({ ...current, flat: event.target.value }))} autoComplete="address-line1" />
                        </label>
                        <label>Area / Sector / Locality *
                            <input required maxLength={160} value={addressForm.area} onChange={event => setAddressForm(current => ({ ...current, area: event.target.value }))} autoComplete="address-line2" />
                        </label>
                        <div className="address-form-city-row">
                            <label>City *
                                <input required maxLength={80} value={addressForm.city} onChange={event => setAddressForm(current => ({ ...current, city: event.target.value }))} autoComplete="address-level2" />
                            </label>
                            <label>State *
                                <input required maxLength={80} value={addressForm.state} onChange={event => setAddressForm(current => ({ ...current, state: event.target.value }))} autoComplete="address-level1" />
                            </label>
                        </div>
                        <label>PIN code *
                            <input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={addressForm.pincode} onChange={event => setAddressForm(current => ({ ...current, pincode: event.target.value.replace(/\D/g, '').slice(0, 6) }))} autoComplete="postal-code" />
                        </label>
                        <label>Enter your full name *
                            <input required maxLength={100} value={addressForm.fullName} onChange={event => setAddressForm(current => ({ ...current, fullName: event.target.value }))} autoComplete="name" />
                        </label>
                        <label>10-digit mobile number *
                            <input required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={addressForm.phone} onChange={event => setAddressForm(current => ({ ...current, phone: event.target.value.replace(/\D/g, '').slice(0, 10) }))} autoComplete="tel" />
                        </label>
                        <label>Alternate phone number (Optional)
                            <input inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={addressForm.alternatePhone} onChange={event => setAddressForm(current => ({ ...current, alternatePhone: event.target.value.replace(/\D/g, '').slice(0, 10) }))} />
                        </label>
                        <fieldset className="address-type-field">
                            <legend>Type of address</legend>
                            <div>
                                {['Home', 'Work'].map(type => <button className={addressForm.type === type ? 'active' : ''} type="button" key={type} aria-pressed={addressForm.type === type} onClick={() => setAddressForm(current => ({ ...current, type }))}>
                                    {type === 'Home' ? <Home size={18} /> : <BriefcaseBusiness size={18} />} {type}
                                </button>)}
                            </div>
                        </fieldset>
                        <button className="address-save-button" type="submit" disabled={savingAddress}>{savingAddress ? 'Saving address…' : 'Save address'}</button>
                    </form>
                </section>
            </div>}
        </main>
    )
}

export default OrderSummary
