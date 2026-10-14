import React, { useEffect, useRef } from 'react'
import "./css/detailPage.css"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchProductDetail, fetchProducts } from '../redux/features/ProductSlice'
import Search from '../components/Header/Search'
import { addToCart } from '../redux/features/CartSlice'
import { useDataContextProvider } from '../context/DataProvider'
import { useState } from 'react'
import toast from "react-hot-toast"
import { ArrowRight, Banknote, ChevronDown, ChevronRight, ChevronUp, CircleCheck, MapPin, PackageCheck, ShieldCheck, Store, ThumbsDown, ThumbsUp, Truck, X } from 'lucide-react'

const DetailPage = () => {

    const [showVariantSheet, setShowVariantSheet] = useState(false);
    const [pendingCheckout, setPendingCheckout] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(2);
    const [selectedSize, setSelectedSize] = useState('');
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const [showSizeChart, setShowSizeChart] = useState(false);
    const [highlightsExpanded, setHighlightsExpanded] = useState(true);
    const [allDetailsExpanded, setAllDetailsExpanded] = useState(false);
    const [reviewsExpanded, setReviewsExpanded] = useState(true);
    const similarProductsRef = useRef(null);
    const productListRequestedRef = useRef(false);

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { setLoginForm, setCheckoutLogin } = useDataContextProvider();

    const { id } = useParams();
    const { product, loadingProduct, products, productsLoaded, loadingProducts } = useSelector(state => state.products)
    const { authenticated } = useSelector(state => state.user)

    useEffect(() => {
        dispatch(fetchProductDetail(id))
    }, [id, dispatch])

    useEffect(() => {
        if (!product?._id) return
        const title = `${product.category || ''} ${product.title?.shortTitle || ''} ${product.title?.longTitle || ''}`
        if (/jean|trouser|pant/i.test(title)) setSelectedSize('28')
        else if (/shoe|sneaker|footwear/i.test(title)) setSelectedSize('5')
        else if (/shirt|dress|t-shirt|sweatshirt|hoodie/i.test(title)) setSelectedSize('M')
        else setSelectedSize('')
    }, [product?._id, product?.category, product?.title?.longTitle, product?.title?.shortTitle])

    useEffect(() => {
        if (!productsLoaded && !loadingProducts && !productListRequestedRef.current) {
            productListRequestedRef.current = true;
            dispatch(fetchProducts())
        }
    }, [dispatch, loadingProducts, productsLoaded])

    useEffect(() => {
        if (pendingCheckout && authenticated && product?._id === id) {
            setPendingCheckout(false)
            setShowVariantSheet(false)
            navigate(`/checkout/${id}/summary`, { state: { selectedSize, selectedVariant } })
        }
    }, [authenticated, id, navigate, pendingCheckout, product?._id, selectedSize, selectedVariant])

    // CART
    const addItToCart = (product, quantity) => {
        dispatch(addToCart({ product, quantity }))
        toast.success('Item added to cart! 🛒')
    }

    if (loadingProduct) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <div className="spinner-border text-dark" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    )

    if (!product?._id) return null;

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (product.reviews) {
        product.reviews.forEach((review) => {
            const rating = Math.round(review.rating);
            if (ratingCounts[rating] !== undefined) {
                ratingCounts[rating]++;
            }
        });
    }
    const productCost = product.price?.cost ?? 0
    const productMrp = product.price?.mrp ?? productCost
    const discountText = product.price?.discount || '0% off'
    const svgIconBase = '/detailpage-icon'
    const productName = product.title?.longTitle || product.title?.shortTitle || 'Product'
    const isFootwear = /shoe|sneaker|footwear/i.test(`${product.category || ''} ${product.title?.shortTitle || ''} ${product.title?.longTitle || ''}`)
    const isJeans = /jean|trouser|pant/i.test(`${product.category || ''} ${product.title?.shortTitle || ''} ${product.title?.longTitle || ''}`)
    const isApparel = isJeans || /shirt|dress|t-shirt|sweatshirt|hoodie/i.test(`${product.category || ''} ${product.title?.shortTitle || ''} ${product.title?.longTitle || ''}`)
    const variantSizeOptions = isJeans
        ? ['28', '30', '32', '34', '36', '38']
        : isFootwear
            ? ['3', '4', '5', '6', '7']
            : isApparel
                ? ['S', 'M', 'L', 'XL', 'XXL']
                : []
    const variants = [
        { label: 'White', className: 'variant-white' },
        { label: 'White/Grey', className: 'variant-grey' },
        { label: 'White/Black', className: 'variant-black' },
        { label: 'White/Blue', className: 'variant-blue' },
    ]
    const productDiscount = String(discountText).match(/[0-9]+%/)?.[0] || '0%'
    const lowestPrice = product.price?.bankOfferPrice || productCost
    const description = product.description || productName
    const reviewEntries = Array.isArray(product.reviews) ? product.reviews : []
    const displayedReviews = reviewEntries
    const averageRating = Number(product.averageRating) || (reviewEntries.length
        ? reviewEntries.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewEntries.length
        : 0)
    const reviewTotal = Number(product.numOfReviews ?? reviewEntries.length)
    const productHighlights = Array.isArray(product.highlights) && product.highlights.length
        ? product.highlights
        : isFootwear
            ? [{ label: 'Outer material', value: 'Mesh' }, { label: 'Occasion', value: 'Casual' }, { label: 'Type For Casual', value: 'Sneakers' }]
            : [{ label: 'Category', value: product.category || 'Product' }, { label: 'Product', value: product.title?.shortTitle || 'Product' }]
    const lovedFeatures = isFootwear
        ? ['Colour', 'Comfort', 'Material Quality', 'Light Weight', 'True to Size']
        : ['Quality', 'Value for money', 'Design', 'Performance']
    const recommendedProducts = (products || [])
        .filter(item => item._id !== product._id && item.category === product.category)
        .concat((products || []).filter(item => item._id !== product._id && item.category !== product.category))
        .slice(0, 8)
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + 5)
    const deliveryDateText = deliveryDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
    })

    const scrollSimilarProducts = () => {
        similarProductsRef.current?.scrollBy({ left: 220, behavior: 'smooth' })
    }

    const continueToCheckout = () => {
        if (variantSizeOptions.length && !selectedSize) {
            toast.error('Please select a size to continue')
            return
        }
        if (authenticated) {
            setShowVariantSheet(false)
            navigate(`/checkout/${id}/summary`, { state: { selectedSize, selectedVariant } })
            return
        }
        setPendingCheckout(true)
        setShowVariantSheet(false)
        setCheckoutLogin(true)
        setLoginForm(true)
    }

    return (
        <>
            <div className="detail-section mobile-detail-shell">
                <div className="mobile-detail-page">
                    <div className="mobile-topbar">
                        <button className="back-button" type="button" aria-label="Go back" onClick={() => navigate(-1)}>
                            <img src={`${svgIconBase}/top-nav-left-arrow-icon.svg`} alt="" />
                        </button>
                        <Search compact />
                        <button className="cart-button" type="button" aria-label="Cart">
                            <img src={`${svgIconBase}/nav-cart-icon.svg`} alt="Cart" />
                        </button>
                    </div>

                    <div className="sale-banner">
                        <span className="sale-label">Sale starts in</span>
                        <div className="sale-pills">
                            <span className="sale-pill">43</span>
                            <span>Hrs</span>
                            <span className="sale-separator">:</span>
                            <span className="sale-pill">00</span>
                            <span>Min</span>
                            <span className="sale-separator">:</span>
                            <span className="sale-pill">13</span>
                            <span>Sec</span>
                        </div>
                    </div>

                    <div className="detail-image-stage">
                        <div className="floating-action-buttons">
                            <button type="button" className="float-button" aria-label="Add to wishlist">
                                <img src={`${svgIconBase}/like-plus-icon.svg`} alt="Wishlist" />
                            </button>
                            <button type="button" className="float-button" aria-label="Share product">
                                <img src={`${svgIconBase}/share-icon.svg`} alt="Share" />
                            </button>
                        </div>
                        <div className="product-visual-card">
                            <img src={product.detailUrl} alt={product.title?.shortTitle || 'product'} />
                        </div>
                        <div className="detail-rating-row">
                            <div className="rating-chip">
                                <span className="rating-score">{averageRating.toFixed(1)}</span>
                                <img className="rating-star" src={`${svgIconBase}/star-icon.svg`} alt="Star rating" />
                                <span className="rating-divider">|</span>
                                <span className="rating-count">{reviewTotal.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-image-pagination" aria-label="Product image 1 of 6">
                        <span className="active" />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>

                    <div className="mobile-detail-body">
                        <section className="product-options-section">
                            <div className="selected-color-line">
                                <strong>Selected Color:</strong> {isFootwear ? variants[selectedVariant].label : 'Dark Blue'}
                            </div>
                            {isFootwear && <div className="variant-list" aria-label="Available colors">
                                {variants.map((variant, index) => (
                                    <button
                                        className={`variant-option ${selectedVariant === index ? 'selected' : ''}`}
                                        type="button"
                                        aria-label={`Select ${variant.label} color`}
                                        aria-pressed={selectedVariant === index}
                                        key={variant.label}
                                        onClick={() => setSelectedVariant(index)}
                                    >
                                        <img className={variant.className} src={product.detailUrl} alt="" />
                                    </button>
                                ))}
                            </div>}

                            {isFootwear && <div className="size-selector">
                                <div className="size-heading">
                                    <strong>Select Size</strong>
                                    <button type="button" onClick={() => setShowSizeChart(!showSizeChart)}>Size Chart</button>
                                </div>
                                <div className="size-options" aria-label="Select shoe size">
                                    {['3', '4', '5', '6', '7'].map(size => (
                                        <button
                                            className={selectedSize === size ? 'selected' : ''}
                                            type="button"
                                            aria-pressed={selectedSize === size}
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                        >{size}</button>
                                    ))}
                                </div>
                                {showSizeChart && <div className="size-chart-panel">
                                    <strong>Size chart</strong>
                                    <span>UK 3: 22 cm</span><span>UK 4: 23 cm</span><span>UK 5: 24 cm</span><span>UK 6: 25 cm</span><span>UK 7: 26 cm</span>
                                </div>}
                            </div>}

                            <a className="brand-store-link" href="#brand-store">Visit brand store</a>
                            <p className={`product-description ${descriptionExpanded ? 'expanded' : ''}`}>
                                {description}
                                {description.length > 85 && <button type="button" onClick={() => setDescriptionExpanded(!descriptionExpanded)}>
                                    {descriptionExpanded ? ' less' : ' more'}
                                </button>}
                            </p>

                            <div className="lowest-price-badge">Lowest Price in the year</div>
                            <div className="product-price-row">
                                <strong className="product-discount">↓{productDiscount}</strong>
                                <span className="product-mrp">₹{productMrp.toLocaleString('en-IN')}</span>
                                <strong className="product-cost">₹{productCost.toLocaleString('en-IN')}</strong>
                            </div>

                            <section className="product-offers-panel" aria-label="Offers">
                                <div className="offers-title">
                                    <span className="wow-deal-badge">WOW!<br />DEAL</span>
                                    <span>Apply offers for maximum savings</span>
                                    <span className="offers-chevron">⌃</span>
                                </div>
                                <div className="offers-content">
                                    <h2>Buy at ₹{lowestPrice.toLocaleString('en-IN')}</h2>
                                    <div className="bank-offers-box">
                                        <strong className="bank-offers-heading">Bank offers</strong>
                                        <div className="bank-offers-list">
                                            {[
                                                { bank: 'Flipkart Axis', amount: '₹48 off', type: 'Credit Card • Cashback', symbol: 'F' },
                                                { bank: 'BHIM', amount: '₹10 off', type: 'UPI • Cashback', symbol: 'U' },
                                                { bank: 'Flipkart SBI', amount: '₹48 off', type: 'Credit Card • Cashback', symbol: 'S' },
                                                { bank: 'CRED', amount: '₹10 off', type: 'UPI', symbol: 'C' },
                                            ].map(offer => (
                                                <article className="bank-offer-card" key={offer.bank}>
                                                    <div className="bank-offer-main">
                                                        <span className="bank-offer-symbol">{offer.symbol}</span>
                                                        <span className="bank-offer-copy"><strong>{offer.amount}</strong><small>{offer.bank}</small></span>
                                                        <button type="button">Apply</button>
                                                    </div>
                                                    <div className="bank-offer-type">{offer.type}</div>
                                                </article>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </section>

                        <section className="delivery-details-section" aria-labelledby="delivery-details-title">
                            <h2 id="delivery-details-title">Delivery details</h2>
                            <div className="delivery-location-row">
                                <MapPin size={16} aria-hidden="true" />
                                <span className="delivery-postcode">201301</span>
                                <button type="button">Select delivery location <ChevronRight size={14} /></button>
                            </div>
                            <div className="delivery-date-row">
                                <Truck size={17} aria-hidden="true" />
                                <strong>Delivery by {deliveryDateText}</strong>
                            </div>
                            <div className="seller-details-row">
                                <Store size={17} aria-hidden="true" />
                                <div>
                                    <div>Fulfilled by {product.sellerName || product.sellerId?.name || 'Flipkart Seller'}</div>
                                    <small>{product.averageRating || '4.5'} ★ • 3 years with Flipkart</small>
                                    <button type="button">See other sellers</button>
                                </div>
                            </div>

                            <div className="service-guarantees">
                                <div><span><PackageCheck size={20} /></span><p>10-Day<br />Return</p></div>
                                <div><span><Banknote size={20} /></span><p>Cash on<br />Delivery</p></div>
                                <div><span><ShieldCheck size={20} /></span><p>Flipkart<br />Assured</p></div>
                            </div>

                            {recommendedProducts.length > 0 && <section className="similar-products-section" aria-labelledby="similar-products-title">
                                <div className="similar-products-heading">
                                    <h2 id="similar-products-title">Similar Products</h2>
                                    <button type="button" aria-label="Scroll similar products" onClick={scrollSimilarProducts}>
                                        <ArrowRight size={19} />
                                    </button>
                                </div>
                                <div className="similar-products-list" ref={similarProductsRef}>
                                    {recommendedProducts.map(item => {
                                        const itemMrp = item.price?.mrp ?? item.price?.cost ?? 0
                                        const itemCost = item.price?.cost ?? 0
                                        const itemDiscount = String(item.price?.discount || '').match(/[0-9]+%/)?.[0]

                                        return <button
                                            className="similar-product-card"
                                            type="button"
                                            key={item._id}
                                            onClick={() => navigate(`/product/${item._id}`)}
                                        >
                                            <span className="similar-product-image">
                                                <img src={item.detailUrl} alt={item.title?.shortTitle || 'Similar product'} />
                                            </span>
                                            <strong className="similar-product-name">{item.title?.shortTitle || 'Product'}</strong>
                                            {itemDiscount && <span className="similar-product-discount">{itemDiscount} OFF</span>}
                                            <span className="similar-product-prices">
                                                <s>₹{itemMrp.toLocaleString('en-IN')}</s>
                                                <strong>₹{itemCost.toLocaleString('en-IN')}</strong>
                                            </span>
                                            <span className="similar-delivery-date">Get it by <strong>{deliveryDateText}</strong></span>
                                        </button>
                                    })}
                                </div>
                            </section>}

                            <section className="detail-accordions">
                                <section className="detail-accordion">
                                    <button className="detail-accordion-heading" type="button" aria-expanded={highlightsExpanded} onClick={() => setHighlightsExpanded(!highlightsExpanded)}>
                                        <strong>Product highlights</strong>
                                        <span>{highlightsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                                    </button>
                                    {highlightsExpanded && <div className="highlights-grid">
                                        {productHighlights.map(item => (
                                            <div className="highlight-item" key={item.label}>
                                                <span>{item.label}</span>
                                                <strong>{item.value}</strong>
                                            </div>
                                        ))}
                                    </div>}
                                </section>

                                <section className="detail-accordion">
                                    <button className="detail-accordion-heading all-details-heading" type="button" aria-expanded={allDetailsExpanded} onClick={() => setAllDetailsExpanded(!allDetailsExpanded)}>
                                        <span><strong>All details</strong><small>Features, description and more</small></span>
                                        <span>{allDetailsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                                    </button>
                                    {allDetailsExpanded && <div className="all-details-content">
                                        <strong>{productName}</strong>
                                        <p>{description}</p>
                                        <dl><dt>Category</dt><dd>{product.category || 'General'}</dd><dt>Price</dt><dd>₹{productCost.toLocaleString('en-IN')}</dd></dl>
                                    </div>}
                                </section>

                                <section className="detail-accordion ratings-accordion">
                                    <button className="detail-accordion-heading" type="button" aria-expanded={reviewsExpanded} onClick={() => setReviewsExpanded(!reviewsExpanded)}>
                                        <strong>Ratings and reviews</strong>
                                        <span>{reviewsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                                    </button>
                                    {reviewsExpanded && <div className="reviews-content">
                                        <div className="overall-rating-row">
                                            <strong>{averageRating.toFixed(1)} <span>★</span></strong>
                                            <span className="rating-quality">{averageRating >= 4 ? 'Very Good' : averageRating >= 3 ? 'Good' : 'Average'}</span>
                                        </div>
                                        <p className="verified-rating-count">{reviewTotal ? `Based on ${reviewTotal.toLocaleString('en-IN')} ratings` : 'No ratings yet'}</p>
                                        <div className="loved-features">
                                            <span>Features customers loved</span>
                                            <div>{lovedFeatures.map(feature => <span key={feature}>{feature}</span>)}</div>
                                        </div>
                                        {displayedReviews.length > 0 ? <div className="review-card-list">
                                            {displayedReviews.slice(0, 2).map((review, index) => (
                                                <article className="customer-review-card" key={`${review._id || review.user || review.name}-${index}`}>
                                                    <div className="customer-review-meta">
                                                        <strong>{review.rating || 5} <span>★</span></strong>
                                                        <strong>{review.title || 'Customer review'}</strong>
                                                    </div>
                                                    <p>{review.description}</p>
                                                    {review.images?.[0] && <div className="review-photo-row"><img src={review.images[0]} alt="Customer review" /></div>}
                                                    <div className="review-author">{review.name || 'Flipkart Customer'} <span>{review.isAdmin ? 'Store review' : <><CircleCheck size={12} /> Verified Buyer</>}</span></div>
                                                    <div className="review-helpful"><button type="button" aria-label="Helpful"><ThumbsUp size={14} /></button><span>0</span><button type="button" aria-label="Not helpful"><ThumbsDown size={14} /></button><span>0</span></div>
                                                </article>
                                            ))}
                                        </div> : <p className="no-reviews-message">No written reviews yet.</p>}
                                        <button className="show-reviews-button" type="button" onClick={() => navigate(`/product/${id}/reviews`)}>
                                            Show all reviews <ChevronRight size={16} />
                                        </button>
                                    </div>}
                                </section>
                            </section>
                        </section>
                    </div>

                    <div className="mobile-buy-footer">
                        <button className="footer-cart-button" type="button" aria-label="Add to cart" onClick={() => addItToCart(product, product.quantity || 1)}>
                            <img src={`${svgIconBase}/cartplus-icon.svg`} alt="" />
                        </button>
                        <div className="detail-buy-row">
                            <button className="emi-option" type="button">
                                <span className="emi-copy">
                                    <strong>Buy with EMI</strong>
                                    <small>From ₹666/m</small>
                                </span>
                            </button>

                            <button className="buy-now-option" type="button" onClick={() => setShowVariantSheet(true)}>
                                <span>Buy now</span>
                                <small>at ₹{productCost.toLocaleString('en-IN')}</small>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
            {showVariantSheet && <div className="variant-sheet-backdrop" role="presentation" onClick={() => setShowVariantSheet(false)}>
                <section className="variant-selection-sheet" role="dialog" aria-modal="true" aria-labelledby="variant-sheet-title" onClick={event => event.stopPropagation()}>
                    <header className="variant-sheet-header">
                        <h2 id="variant-sheet-title">Select variant</h2>
                        <button type="button" aria-label="Close variant selection" onClick={() => setShowVariantSheet(false)}><X size={24} /></button>
                    </header>
                    <div className="variant-sheet-product">
                        <img src={product.detailUrl} alt={product.title?.shortTitle || 'Product'} />
                        <div>
                            <strong>{product.title?.shortTitle || productName}</strong>
                            <p>{product.title?.longTitle || productName}</p>
                            <div><s>₹{productMrp.toLocaleString('en-IN')}</s><b>₹{productCost.toLocaleString('en-IN')}</b></div>
                        </div>
                    </div>
                    {isFootwear && <div className="variant-sheet-colors" aria-label="Choose color">
                        {variants.map((variant, index) => <button
                            className={selectedVariant === index ? 'selected' : ''}
                            type="button"
                            aria-label={`Select ${variant.label}`}
                            aria-pressed={selectedVariant === index}
                            key={variant.label}
                            onClick={() => setSelectedVariant(index)}
                        ><img className={variant.className} src={product.detailUrl} alt="" /></button>)}
                    </div>}
                    {variantSizeOptions.length > 0 && <div className="variant-sheet-sizes">
                        <div className="variant-size-options">
                            {variantSizeOptions.map(size => <button
                                className={selectedSize === size ? 'selected' : ''}
                                type="button"
                                aria-pressed={selectedSize === size}
                                key={size}
                                onClick={() => setSelectedSize(size)}
                            >{size}</button>)}
                        </div>
                        {isJeans && <span className="variant-stock-note">Only 1 left</span>}
                    </div>}
                    <button className="variant-continue-button" type="button" disabled={variantSizeOptions.length > 0 && !selectedSize} onClick={continueToCheckout}>Continue</button>
                </section>
            </div>}
        </>
    )
}

export default DetailPage