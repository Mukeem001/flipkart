import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import flipkartIcon from "../../../../../assetsicon/flipkart icon.png"
import flipkartText from "../../../../../assetsicon/flipkart text.png"
import minutesIcon from "../../../../../assetsicon/bike icon.png"
import minutesText from "../../../../../assetsicon/minutes text icon.png"
import travelPlaneIcon from "../../../../../assetsicon/travel plane icon.png"
import travelText from "../../../../../assetsicon/travel text.png"
import { bannerData, navData } from "../../../constants/Data"
import "./DesktopHome.css"
import forYouIcon from "../../../../../flipkart-icon-svg/for-you.svg"
import fashionIcon from "../../../../../flipkart-icon-svg/faishion.svg"
import mobileIcon from "../../../../../flipkart-icon-svg/mobiles.svg"
import electronicsIcon from "../../../../../flipkart-icon-svg/electronics.svg"
import beautyIcon from "../../../../../flipkart-icon-svg/beauty.svg"
import homeIcon from "../../../../../flipkart-icon-svg/home.svg"
import appliancesIcon from "../../../../../flipkart-icon-svg/appliances.svg"
import toysIcon from "../../../../../flipkart-icon-svg/toys-baby.svg"
import foodIcon from "../../../../../flipkart-icon-svg/food-healthy.svg"
import autoIcon from "../../../../../flipkart-icon-svg/auto-accessories.svg"
import sportsIcon from "../../../../../flipkart-icon-svg/sports.svg"
import furnitureIcon from "../../../../../flipkart-icon-svg/furniture.svg"
import booksIcon from "../../../../../flipkart-icon-svg/books.svg"
import twoWheelerIcon from "../../../../../flipkart-icon-svg/2-wheelers.svg"

const categories = [
    { label: "For You", icon: forYouIcon },
    { label: "Fashion", icon: fashionIcon },
    { label: "Mobiles", icon: mobileIcon },
    { label: "Electronics", icon: electronicsIcon },
    { label: "Beauty", icon: beautyIcon },
    { label: "Home", icon: homeIcon },
    { label: "Appliances", icon: appliancesIcon },
    { label: "Toys, Baby & More", icon: toysIcon },
    { label: "Food & Healthcare", icon: foodIcon },
    { label: "Auto Accessories", icon: autoIcon },
    { label: "Sports & Fitness", icon: sportsIcon },
    { label: "Furniture", icon: furnitureIcon },
    { label: "Books", icon: booksIcon },
    { label: "2 Wheelers", icon: twoWheelerIcon },
]

const normalizeCategory = value => String(value || "").trim().toLowerCase()

const getProducts = (products, labels, offset = 0, limit = 6) => {
    const matches = products.filter(product => labels.includes(normalizeCategory(product.category)))
    const candidates = matches.length ? matches : [...products.slice(offset), ...products.slice(0, offset)]
    return candidates.slice(0, limit)
}

const DesktopProductCard = ({ product, compact = false }) => (
    <Link className={`desktop-product-card${compact ? " desktop-product-card-compact" : ""}`} to={`/product/${product._id}`}>
        <span className="desktop-product-image">
            <img src={product.detailUrl} alt={product.title?.shortTitle || "Product"} loading="lazy" />
        </span>
        <span className="desktop-product-name">{product.title?.shortTitle || product.title?.longTitle || "Product"}</span>
        <strong className="desktop-product-offer">
            {product.price?.discount ? `Min. ${product.price.discount} Off` : `₹${product.price?.cost?.toLocaleString("en-IN") || "0"}`}
        </strong>
    </Link>
)

const DesktopDealSection = ({ title, products, tone = "orange" }) => (
    <section className={`desktop-deal-section desktop-deal-${tone}`}>
        <div className="desktop-deal-title-row">
            <h2>{title}</h2>
            <Link to="/categories" aria-label={`Explore ${title}`}><ChevronRight size={18} /></Link>
        </div>
        <div className="desktop-deal-cards">
            {products.map(product => <DesktopProductCard key={product._id} product={product} />)}
        </div>
    </section>
)

export const DesktopBrandBar = () => (
    <div className="desktop-brandbar">
        <div className="desktop-brandbar-inner">
            <Link className="desktop-brand-choice desktop-brand-choice-active" to="/">
                <img src={flipkartIcon} alt="" />
                <img src={flipkartText} alt="Flipkart" />
            </Link>
            <Link className="desktop-brand-choice" to="/categories">
                <img src={minutesIcon} alt="" />
                <img src={minutesText} alt="Minutes" />
            </Link>
            <a className="desktop-brand-choice" href="https://www.cleartrip.com/" target="_blank" rel="noreferrer">
                <img src={travelPlaneIcon} alt="" />
                <img src={travelText} alt="Travel" />
            </a>
            <Link className="desktop-brand-choice desktop-grocery-choice" to="/categories">
                <img src={navData[0].url} alt="" />
                <strong>Grocery</strong>
            </Link>
            <button className="desktop-location-button" type="button">
                <MapPin size={14} /> Location not set <strong>Select delivery location</strong><ChevronRight size={13} />
            </button>
        </div>
    </div>
)

const DesktopBannerRail = () => {
    const railRef = useRef(null)
    const [slideIndex, setSlideIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(true)
    const banners = [...bannerData, bannerData[0]]

    useEffect(() => {
        const interval = window.setInterval(() => {
            setSlideIndex(index => index + 1)
        }, 7000)

        return () => window.clearInterval(interval)
    }, [])

    useEffect(() => {
        if (slideIndex !== bannerData.length) return undefined

        const resetTimeout = window.setTimeout(() => {
            setIsTransitioning(false)
            setSlideIndex(0)
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => setIsTransitioning(true))
            })
        }, 1400)

        return () => window.clearTimeout(resetTimeout)
    }, [slideIndex])

    const firstCard = railRef.current?.querySelector(".desktop-banner-card")
    const cardGap = firstCard ? Number.parseFloat(getComputedStyle(firstCard.parentElement).columnGap) || 0 : 0
    const slideDistance = firstCard ? firstCard.getBoundingClientRect().width + cardGap : 428

    return (
        <section className="desktop-banner-section" aria-label="Featured offers">
            <div className="desktop-banner-viewport" ref={railRef}>
                <div
                    className={`desktop-banner-rail${isTransitioning ? " is-transitioning" : ""}`}
                    style={{ transform: `translateX(-${slideIndex * slideDistance}px)` }}
                >
                    {banners.map((banner, index) => (
                        <Link
                            to="/categories"
                            className="desktop-banner-card"
                            key={`${banner.id}-${index}`}
                            aria-label={`Featured offer ${(index % bannerData.length) + 1}`}
                            tabIndex={index === bannerData.length ? -1 : undefined}
                        >
                            <img src={banner.url} alt={index === bannerData.length ? "" : `Featured shopping offer ${index + 1}`} />
                            {index < bannerData.length && <span className="desktop-ad-pill">AD</span>}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

const DesktopHome = ({ products, techDealProducts, fashionDealProducts }) => {
    const { user } = useSelector(state => state.user)
    const productRailRef = useRef(null)
    const productRail = products.slice(0, 10)
    const categoriesForDeals = getProducts(products, ["electronics", "appliances", "mobiles"], 0, 4)
    const fashionProducts = fashionDealProducts.length
        ? fashionDealProducts
        : getProducts(products, ["fashion", "fashion deals"], 4, 4)
    const everydayProducts = getProducts(products, ["home", "travel", "furniture", "fashion"], 8, 4)
    const gadgetProducts = getProducts(products, ["smart gadgets", "appliances", "electronics"], 12, 4)
    const spotlightProducts = products.slice(0, 6)
    const displayName = user?.name?.split(" ")[0] || "there"

    return (
        <main className="desktop-home">
            <nav className="desktop-category-nav" aria-label="Shop categories">
                {categories.map((category, index) => (
                    <Link key={category.label} to={index === 0 ? "/" : "/categories"} className={index === 0 ? "active" : ""}>
                        <img src={category.icon} alt="" />
                        <span>{category.label}</span>
                    </Link>
                ))}
            </nav>

            <DesktopBannerRail />

            <section className="desktop-personalized-section">
                <div className="desktop-personalized-heading">
                    <h1>{user?.name ? `${displayName}, still looking for these?` : "Still looking for these?"}</h1>
                </div>
                <div className="desktop-personalized-rail" ref={productRailRef}>
                    {productRail.map(product => <DesktopProductCard key={product._id} product={product} compact />)}
                </div>
                <button
                    className="desktop-personalized-arrow"
                    type="button"
                    aria-label="See more products"
                    onClick={() => productRailRef.current?.scrollBy({ left: productRailRef.current.clientWidth * 0.75, behavior: "smooth" })}
                >
                    <ChevronRight size={21} />
                </button>
            </section>

            <DesktopDealSection title="Must-have Electronics & Appliances" products={categoriesForDeals} tone="orange" />
            <DesktopDealSection title="Widest collection" products={fashionProducts} tone="pink" />

            <section className="desktop-spotlight">
                <div className="desktop-section-heading">
                    <h2>In The Spotlight</h2>
                    <Link to="/categories" aria-label="Explore all categories"><ChevronRight size={19} /></Link>
                </div>
                <div className="desktop-spotlight-track">
                    {spotlightProducts.map(product => <DesktopProductCard key={product._id} product={product} compact />)}
                </div>
            </section>

            <DesktopDealSection title="Top deals on tech" products={techDealProducts.slice(0, 6)} tone="pink" />
            <DesktopDealSection title="Top deals on everyday living" products={everydayProducts} tone="orange" />
            <DesktopDealSection title="Best Gadgets & Appliances" products={gadgetProducts} tone="orange" />
        </main>
    )
}

export default DesktopHome
