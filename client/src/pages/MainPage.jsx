import "./css/mainPage.css"
import Header from '../components/Header/Header'
import Navbar from '../components/MainPage/Navbar/Navbar'
import Carousel from '../components/MainPage/Carousel/Carousel'
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import TopStories from "../components/MainPage/TopStories/TopStories"
import Footer from "../components/Footer/Footer"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { fetchProducts } from "../redux/features/ProductSlice"
import techDealsBackground from "../../../backgroung-images/top-tech-deals-revealed-bg-image.png"
import fashionDealsBackground from "../../../backgroung-images/best-value-deals-on-faishion-bg-image.webp"
import creditCardIcon from "../../../sliicons/credit-card-icon.png"
import emiIcon from "../../../sliicons/EMI-icon.png"
import payLaterIcon from "../../../sliicons/pay-lator-icon.png"
import genZIcon from "../../../sliicons/for-zenz-icon.png"
import payIcon from "../../../sliicons/pay-icon.png"
import sellPhoneIcon from "../../../sliicons/Sell-phone-icon.jpg"
import { getHomePromoProducts } from "../utils/homePromoProducts"

const shoppingShortcuts = [
    { label: "Credit Card", icon: creditCardIcon },
    { label: "EMI", icon: emiIcon },
    { label: "Pay Later", icon: payLaterIcon },
    { label: "For GenZ", icon: genZIcon },
    { label: "Pay", icon: payIcon },
    { label: "Sell Phone", icon: sellPhoneIcon },
]

const MainPage = () => {

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(fetchProducts())
    }, [dispatch])

    const { products = [], loadingProducts, productsLoaded, error } = useSelector(state => state.products)
    const promoProducts = getHomePromoProducts(products)
    const techDealProducts = products
        .filter(product => ["Top Deals", "Electronics"].includes(product.category))
        .slice(0, 7)
    const fashionDealProducts = products
        .filter(product => product.category === "Fashion Deals")
        .slice(0, 4)

    if (!productsLoaded || (loadingProducts && products.length === 0)) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <div className="spinner-border text-primary" role="status" aria-label="Loading products">
                <span className="visually-hidden">Loading products...</span>
            </div>
        </div>
    )

    if (error) return (
        <div className="catalog-state" role="alert">
            <p>Products could not be loaded. Check that the API server is running and VITE_API_URL is set.</p>
            <button type="button" onClick={() => dispatch(fetchProducts())}>Retry</button>
        </div>
    )

    if (products.length === 0) return (
        <div className="catalog-state" role="status">No products are available right now.</div>
    )

    return (
        <div className="main-page">
            <Header />
            <div className="main-page-container">
                <Navbar />
                <Carousel />
                <div className="mobile-promo-grid">
                    {promoProducts.map(({ product, label, offer }) => (
                        <Link key={product._id} className="mobile-promo-card" to={`/product/${product._id}`}>
                            <span className="mobile-promo-image">
                                <img src={product.detailUrl} alt={product.title?.shortTitle} />
                                <span className="mobile-ad-label">AD</span>
                                <span className="mobile-promo-offer">{offer}</span>
                            </span>
                            <span className="mobile-promo-title">{label}</span>
                        </Link>
                    ))}
                </div>
                <div className="mobile-featured-deals">
                    <section className="mobile-deal-panel mobile-tech-panel" style={{ "--deal-background-image": `url(${techDealsBackground})` }}>
                        <div className="mobile-deal-heading">
                            <h2>Top tech deals revealed</h2>
                        </div>
                        <div className="mobile-tech-track">
                            {techDealProducts.map(product => (
                                <Link key={product._id} className="mobile-tech-card" to={`/product/${product._id}`}>
                                    <span className="mobile-tech-image">
                                        <img src={product.detailUrl} alt={product.title?.shortTitle} />
                                        <span className="mobile-ad-label">AD</span>
                                    </span>
                                    <span className="mobile-tech-price">From &#8377;{product.price?.cost?.toLocaleString('en-IN')}</span>
                                    <span className="mobile-tech-title">{product.title?.shortTitle}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                    <section className="mobile-deal-panel mobile-fashion-panel" style={{ "--deal-background-image": `url(${fashionDealsBackground})` }}>
                        <div className="mobile-deal-heading">
                            <h2>Best Value Deals on Fashion</h2>
                            <Link to="/categories" aria-label="View fashion deals">
                                <FontAwesomeIcon icon={faArrowRight} />
                            </Link>
                        </div>
                        <div className="mobile-fashion-grid">
                            {fashionDealProducts.map(product => (
                                <Link key={product._id} className="mobile-fashion-card" to={`/product/${product._id}`}>
                                    <img src={product.detailUrl} alt={product.title?.shortTitle} />
                                    <span>{product.title?.shortTitle}</span>
                                    <strong>Min. {product.price?.discount} Off</strong>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
                <section className="mobile-store-feed" aria-label="More products and services">
                    <nav className="mobile-service-shortcuts" aria-label="Payment and services">
                        {shoppingShortcuts.map(item => (
                            <Link key={item.label} to="/categories" className="mobile-service-shortcut">
                                <img src={item.icon} alt="" />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                    <div className="mobile-product-grid">
                        {products.map(product => (
                            <Link key={product._id} className="mobile-catalog-card" to={`/product/${product._id}`}>
                                <span className="mobile-catalog-image">
                                    <img src={product.detailUrl} alt={product.title?.shortTitle || "Product"} />
                                    {product.category === "Fashion Deals" && <span className="mobile-value365-tag">Value 365</span>}
                                    {product.averageRating > 0 && (
                                        <span className="mobile-rating-tag">
                                            {product.averageRating} <span aria-hidden="true">★</span>
                                            {product.numOfReviews > 0 && ` (${product.numOfReviews.toLocaleString('en-IN')})`}
                                        </span>
                                    )}
                                </span>
                                <span className="mobile-catalog-title">
                                    <strong>{product.title?.shortTitle}</strong>
                                    <span>{product.title?.longTitle}</span>
                                </span>
                                <span className="mobile-catalog-prices">
                                    {product.price?.mrp > product.price?.cost && <del>&#8377;{product.price.mrp.toLocaleString('en-IN')}</del>}
                                    <strong className="mobile-catalog-price-current">&#8377;{product.price?.cost?.toLocaleString('en-IN')}</strong>
                                </span>
                                {product.price?.bankOfferPrice > 0 && (
                                    <span className="mobile-bank-offer">
                                        <strong>&#8377;{product.price.bankOfferPrice.toLocaleString('en-IN')}</strong> with Bank offer
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>
                </section>
                <TopStories />
            </div>
            <Footer />
        </div>
    )
}

export default MainPage