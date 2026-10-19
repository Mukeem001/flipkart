import "./Css/Header.css"
import { useDataContextProvider } from '../../context/DataProvider';
import { Link, useLocation, useNavigate } from "react-router-dom"
import Search from './Search';
import { useDispatch, useSelector } from 'react-redux';
import { logOutUser } from "../../redux/features/UserSlice";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import toast from "react-hot-toast"
import {
    BellRing,
    CircleHelp,
    FileText,
    Languages,
    MapPin,
    MessageSquareText,
    PencilLine,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Store,
    Headset,
    UserRound,
    WalletCards
} from 'lucide-react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBolt,
    faBoxOpen,
    faCartShopping,
    faChevronRight,
    faCreditCard,
    faHandHoldingDollar,
    faHeadset,
    faHeart,
    faHouse,
    faLandmark,
    faLocationDot,
    faTableCellsLarge,
    faTicket,
    faUser,
    faWallet
} from "@fortawesome/free-solid-svg-icons";
import flipkartIcon from "../../../../assetsicon/flipkart icon.png";
import flipkartText from "../../../../assetsicon/flipkart text.png";
import travelPlaneIcon from "../../../../assetsicon/travel plane icon.png";
import travelText from "../../../../assetsicon/travel text.png";
import minutesIcon from "../../../../assetsicon/bike icon.png";
import minutesText from "../../../../assetsicon/minutes text icon.png";
import value365Icon from "../../../../assetsicon/percenttag icon.png";
import value365Text from "../../../../assetsicon/value 365 text icon.png";
import { fetchProducts } from "../../redux/features/ProductSlice";
import { bannerData } from "../../constants/Data";
import { useAppBack } from "../../hooks/useAppBack";

const getNameFromEmail = (email) => {
    const emailName = email?.split("@")[0]?.split("+")[0]
    if (!emailName) return ""

    return emailName
        .split(/[._-]+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
}

const Header = () => {

    const [sidebar, setSidebar] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const isAccountPage = location.pathname === '/account'
    let totalCartQuantity = 0
    const dispatch = useDispatch()
    const { setLoginForm, setCheckoutLogin } = useDataContextProvider();

    const { user } = useSelector(state => state.user)
    const { cartItems } = useSelector(state => state.cart)

    const toggleForm = () => {
        setLoginForm(true)
    }

    const openAccountLogin = () => {
        setCheckoutLogin(true)
        setLoginForm(true)
    }

    const logout = async() => {
        try {
            await dispatch(logOutUser()).unwrap()
            toast.error("Logged Out")
        } catch {
            toast.error("Failed to LogOut !")
        }
    }

    return (
        <>
            {sidebar
                ?
                <Sidebar setSidebar={setSidebar} sidebar={sidebar} logout={logout} toggleForm={toggleForm} />
                :
                <></>
            }
            {!isAccountPage && location.pathname !== '/cart' && <div className="mobile-home-header">
                <div className="mobile-brand-switch">
                    <Link to="/" className="mobile-brand-choice mobile-brand-choice-active">
                        <img className="mobile-brand-icon" src={flipkartIcon} alt="" />
                        <img className="mobile-brand-wordmark" src={flipkartText} alt="Flipkart" />
                    </Link>
                    <Link to="/categories" className="mobile-brand-choice">
                        <img className="mobile-brand-icon" src={minutesIcon} alt="" />
                        <img className="mobile-brand-wordmark" src={minutesText} alt="Minutes" />
                    </Link>
                    <a className="mobile-brand-choice" href="https://www.cleartrip.com/" target="_blank" rel="noreferrer">
                        <img className="mobile-brand-icon" src={travelPlaneIcon} alt="" />
                        <img className="mobile-brand-wordmark" src={travelText} alt="Travel" />
                    </a>
                    <Link to="/categories" className="mobile-brand-choice">
                        <img className="mobile-brand-icon" src={value365Icon} alt="" />
                        <img className="mobile-brand-wordmark" src={value365Text} alt="Value 365" />
                    </Link>
                </div>
                <button className="mobile-delivery-location" type="button">
                    <FontAwesomeIcon icon={faLocationDot} />
                    <span>201301</span>
                    <strong>Select delivery location</strong>
                    <FontAwesomeIcon icon={faChevronRight} className="location-chevron" />
                </button>
            </div>}
            {!isAccountPage && location.pathname !== '/cart' && <div className="mobile-sticky-search"><Search /></div>}
            <div className="header">
                <img src="https://cdn-icons-png.flaticon.com/128/1828/1828859.png" className="mobile-menu" alt="menu-icon" onClick={() => setSidebar(!sidebar)} />
                <Link to={"/"}>
                    <div className="flipkart-logo">
                        <img src="https://images.seeklogo.com/logo-png/62/2/flipkart-logo-png_seeklogo-622636.png" title="Flipkart"></img>
                    </div>
                </Link>
                <Search />
                {user
                    ?
                    <div className="login header-icons">
                        <div className="dropdown">
                            <button className="btn dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/profile-52e0dc.svg" alt="" />
                                <p>{user.name}</p>
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                <Link to={"/my-orders"} style={{ all: "unset" }}>
                                    <li className="dropdown-item"><img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/orders-bfe8c4.svg" alt="" /> Orders</li>
                                </Link>
                                <li><a onClick={() => logout()} className="dropdown-item" href="#"><img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/logout-e63ddf.svg" alt="" /> Log Out</a></li>
                            </ul>
                        </div>
                    </div>
                    :
                    <div onClick={toggleForm} className="login header-icons">
                        <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/profile-52e0dc.svg" alt="" />
                        <p>Login</p>
                        <i className="fa-solid fa-angle-down"></i>
                    </div>
                }
                <Link style={{ textDecoration: "none", color: "black" }} to={"/cart"}>
                    <div className="cart header-icons">
                        {cartItems.forEach((product) => {
                            totalCartQuantity = totalCartQuantity + product.quantity
                        })}
                        {totalCartQuantity < 1 ? <></> : <div className="cart-red-icon">{totalCartQuantity}</div>}
                        <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/header_cart-eed150.svg" alt="" />
                        <p>Cart</p>
                    </div>
                </Link>
                <div className="become-a-seller header-icons">
                    <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/Store-9eeae2.svg" alt="" />
                    <p>Become a Seller</p>
                </div>
                <div className="more-options">
                    <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/header_3verticalDots-ea7819.svg" alt="" />
                </div>
            </div>
            <MobileBottomNav />
            {isAccountPage && <AccountPageContent user={user} openLogin={openAccountLogin} navigate={navigate} logout={logout} />}
        </>
    )
}

export const MobileBottomNav = () => {
    const location = useLocation()
    const { cartItems } = useSelector(state => state.cart)
    const totalCartQuantity = cartItems.reduce((total, product) => total + product.quantity, 0)

    return <nav className={`mobile-bottom-nav ${location.pathname === '/cart' ? 'cart-mobile-bottom-nav' : ''}`} aria-label="Primary navigation">
        <Link to="/" className={`mobile-bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faHouse} />
            <span>Home</span>
        </Link>
        <Link to="/categories" className={`mobile-bottom-nav-item ${location.pathname === '/categories' ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faTableCellsLarge} />
            <span>Categories</span>
        </Link>
        <Link to="/account" className={`mobile-bottom-nav-item ${location.pathname === '/account' ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faUser} />
            <span>Account</span>
        </Link>
        <Link to="/cart" className={`mobile-bottom-nav-item ${location.pathname === '/cart' ? 'active' : ''}`}>
            <span className="mobile-cart-icon">
                <FontAwesomeIcon icon={faCartShopping} />
                {totalCartQuantity > 0 && <span className="mobile-cart-count">{totalCartQuantity}</span>}
            </span>
            <span>Cart</span>
        </Link>
    </nav>
}

const AccountPageContent = ({ user, openLogin, navigate, logout }) => {
    const showUnavailable = (name) => toast(`${name} is not available yet`)
    const dispatch = useDispatch()
    const goBack = useAppBack('/')
    const { products = [], productsLoaded, loadingProducts } = useSelector(state => state.products)
    const displayName = getNameFromEmail(user?.email) || user?.name || "Account"

    useEffect(() => {
        if (user && !productsLoaded && !loadingProducts) dispatch(fetchProducts())
    }, [dispatch, user, productsLoaded, loadingProducts])

    if (user) {
        const accountActions = [
            { label: 'Orders', icon: faBoxOpen, onClick: () => navigate('/my-orders') },
            { label: 'Wishlist', icon: faHeart, onClick: () => showUnavailable('Wishlist') },
            { label: 'Coupons', icon: faTicket, onClick: () => showUnavailable('Coupons') },
            { label: 'Help Center', icon: faHeadset, onClick: () => showUnavailable('Help Center') },
        ]

        const financeOptions = [
            { title: 'Flipkart Personal Loan', sub: 'Up to ₹10 Lakh | Instant disbursal', icon: faLandmark },
            { title: 'Pre-Approved Supermoney Credit Card', sub: '1% cashback on UPI & Non-UPI | 100% Approval | Lifetime Free', icon: faCreditCard },
            { title: 'Flipkart EMI - The Big Billion Days Special!', sub: 'Up to ₹2 Lakh Credit | ₹1,000 Discount* | No Cost EMI', icon: faHandHoldingDollar },
            { title: 'Flipkart Pay Later - Almost there', sub: 'Upto ₹200 off on FK, Myntra | Zero charges', icon: faWallet },
        ]

        const accountSettings = [
            { label: 'Flipkart Plus', icon: Sparkles },
            { label: 'Manage Devices', icon: Smartphone },
            { label: 'Edit Profile', icon: UserRound },
            { label: 'Saved Credit / Debit & Gift Cards', icon: WalletCards },
            { label: 'Saved Addresses', icon: MapPin },
            { label: 'Select Language', icon: Languages },
            { label: 'Notification Settings', icon: BellRing },
            { label: 'Privacy Center', icon: ShieldCheck },
        ]

        const myActivity = [
            { label: 'Reviews', icon: PencilLine },
            { label: 'Questions & Answers', icon: MessageSquareText },
        ]

        const earnWithFlipkart = [
            { label: 'Sell on Flipkart', icon: Store },
        ]

        const feedbackInfo = [
            { label: 'Terms, Policies and Licenses', icon: FileText },
            { label: 'Browse FAQs', icon: CircleHelp },
        ]
        const recentlyViewedProducts = products.slice(0, 8)

        return <main className="mobile-account-page logged-in-account">
            <section className="account-hero-card">
                <div className="account-hero-top">
                    <h2>{displayName}</h2>
                    <div className="account-black-badge">
                        <FontAwesomeIcon icon={faBolt} />
                        <span>0</span>
                    </div>
                </div>
                <p>Enjoy FREE YouTube Premium, Early Access to sale and more with Black.</p>
                <button type="button" className="account-black-button">Explore <span>BLACK</span></button>
            </section>

            <section className="account-action-grid">
                {accountActions.map(({ label, icon, onClick }) => (
                    <button key={label} type="button" className="account-action-tile" onClick={onClick}>
                        <FontAwesomeIcon icon={icon} />
                        <span>{label}</span>
                    </button>
                ))}
            </section>

            <section className="account-finance-panel">
                <h3>Finance Options</h3>
                {financeOptions.map(({ title, sub, icon }) => (
                    <button key={title} type="button" className="account-finance-row" onClick={() => showUnavailable(title)}>
                        <span className="account-finance-icon"><FontAwesomeIcon icon={icon} /></span>
                        <span className="account-finance-text">
                            <strong>{title}</strong>
                            <small>{sub}</small>
                        </span>
                        <span className="account-finance-chevron"><FontAwesomeIcon icon={faChevronRight} /></span>
                    </button>
                ))}
            </section>

            {recentlyViewedProducts.length > 0 && <section className="account-recently-viewed">
                <h3>Recently Viewed Stores</h3>
                <div className="account-recently-grid">
                    {recentlyViewedProducts.map(product => (
                        <button key={product._id} type="button" className="account-recently-item" onClick={() => navigate(`/product/${product._id}`)}>
                            <img src={product.detailUrl} alt={product.title?.shortTitle || 'Product'} />
                            <span>{product.title?.shortTitle || 'Product'}</span>
                        </button>
                    ))}
                </div>
            </section>}

            <section className="account-sponsored">
                <h3>Sponsored</h3>
                <img src={bannerData[0].url} alt="Sponsored offer" />
            </section>

            <section className="account-settings-panel">
                <h3>Account Settings</h3>
                <div className="account-settings-list">
                    {accountSettings.map(({ label, icon: Icon }) => (
                        <button key={label} type="button" className="account-settings-row" onClick={() => showUnavailable(label)}>
                            <span className="account-settings-icon"><Icon size={22} strokeWidth={1.8} /></span>
                            <span className="account-settings-label">{label}</span>
                            <span className="account-settings-chevron"><FontAwesomeIcon icon={faChevronRight} /></span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="account-settings-panel compact-panel">
                <h3>My Activity</h3>
                <div className="account-settings-list">
                    {myActivity.map(({ label, icon: Icon }) => (
                        <button key={label} type="button" className="account-settings-row" onClick={() => showUnavailable(label)}>
                            <span className="account-settings-icon"><Icon size={22} strokeWidth={1.8} /></span>
                            <span className="account-settings-label">{label}</span>
                            <span className="account-settings-chevron"><FontAwesomeIcon icon={faChevronRight} /></span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="account-settings-panel compact-panel">
                <h3>Earn with Flipkart</h3>
                <div className="account-settings-list">
                    {earnWithFlipkart.map(({ label, icon: Icon }) => (
                        <button key={label} type="button" className="account-settings-row" onClick={() => showUnavailable(label)}>
                            <span className="account-settings-icon"><Icon size={22} strokeWidth={1.8} /></span>
                            <span className="account-settings-label">{label}</span>
                            <span className="account-settings-chevron"><FontAwesomeIcon icon={faChevronRight} /></span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="account-settings-panel compact-panel">
                <h3>Feedback &amp; Information</h3>
                <div className="account-settings-list">
                    {feedbackInfo.map(({ label, icon: Icon }) => (
                        <button key={label} type="button" className="account-settings-row" onClick={() => showUnavailable(label)}>
                            <span className="account-settings-icon"><Icon size={22} strokeWidth={1.8} /></span>
                            <span className="account-settings-label">{label}</span>
                            <span className="account-settings-chevron"><FontAwesomeIcon icon={faChevronRight} /></span>
                        </button>
                    ))}
                </div>
            </section>

            <div className="account-logout-area">
                <button type="button" className="account-logout-button" onClick={logout}>Log Out</button>
            </div>
        </main>
    }

    return <main className="mobile-account-page">
        <div className="account-page-heading">
            <button type="button" aria-label="Go back" onClick={goBack}><img src="/detailpage-icon/top-nav-left-arrow-icon.svg" alt="" /></button>
            <h1>Account</h1>
        </div>

        <section className="account-login-prompt">
            <p>{user ? `Hi ${displayName}` : 'Log in to get exclusive offers'}</p>
            <button type="button" onClick={() => user ? navigate('/my-orders') : openLogin()}>{user ? 'My Orders' : 'Log In'}</button>
        </section>

        <section className="account-menu-section">
            <h2>Account Settings</h2>
            <button type="button" className="account-menu-row" onClick={() => showUnavailable('Language selection')}>
                <Languages /><span>Select Language</span><i>›</i>
            </button>
            <button type="button" className="account-menu-row" onClick={() => showUnavailable('Notification settings')}>
                <BellRing /><span>Notification Settings</span><i>›</i>
            </button>
            <button type="button" className="account-menu-row" onClick={() => showUnavailable('Help Center')}>
                <Headset /><span>Help Center</span><i>›</i>
            </button>
        </section>

        <section className="account-menu-section">
            <h2>Earn with Flipkart</h2>
            <button type="button" className="account-menu-row" onClick={() => showUnavailable('Sell on Flipkart')}>
                <Store /><span>Sell on Flipkart</span><i>›</i>
            </button>
        </section>

        <section className="account-menu-section">
            <h2>Feedback &amp; Information</h2>
            <button type="button" className="account-menu-row" onClick={() => showUnavailable('Terms, Policies and Licenses')}>
                <FileText /><span>Terms, Policies and Licenses</span><i>›</i>
            </button>
            <button type="button" className="account-menu-row" onClick={() => showUnavailable('Browse FAQs')}>
                <CircleHelp /><span>Browse FAQs</span><i>›</i>
            </button>
        </section>
    </main>
}

export default Header