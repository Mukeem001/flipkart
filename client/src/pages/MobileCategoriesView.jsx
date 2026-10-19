import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowDown, ArrowLeft, Search, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppBack } from "../hooks/useAppBack";
import { fetchProducts } from "../redux/features/ProductSlice";
import { getMobileCategoryProducts, getMobilePromoProducts } from "../utils/mobileCategoryProducts";
import "./css/categories.css";
import sidebarAppliances from "../categories-image/appliances.webp";
import sidebarAuto from "../categories-image/auto accessrioes.png";
import sidebarBeauty from "../categories-image/beauty and personal care.webp";
import sidebarBikes from "../categories-image/bike and sccoters.webp";
import sidebarBooks from "../categories-image/books and media.webp";
import sidebarElectronics from "../categories-image/electronics.webp";
import sidebarFashion from "../categories-image/fashion.webp";
import sidebarFood from "../categories-image/food and healthcare.png";
import sidebarForYou from "../categories-image/for you.jpg";
import sidebarFurniture from "../categories-image/furniture.webp";
import sidebarGadgets from "../categories-image/smart gadgets.webp";
import sidebarHome from "../categories-image/home.webp";
import sidebarMobiles from "../categories-image/phone.jpg";
import sidebarPets from "../categories-image/pet store.jpg";
import sidebarSports from "../categories-image/sports and fitness.webp";
import sidebarToys from "../categories-image/toy and baby care.webp";
import sidebarTravel from "../categories-image/travel.webp";
import sidebarGames from "../categories-image/software and games.webp";
import sidebarGiftCards from "../categories-image/gift cards.jpg";
import sidebarSellDevices from "../categories-image/sell old devices.webp";
import mainAcerTab from "../categories-image/acer iconia tab.webp";
import mainAirFryers from "../categories-image/adt air fires.webp";
import mainAxisCard from "../categories-image/flipkart axisbank credit card.webp";
import mainBills from "../categories-image/bills and recharges.webp";
import mainBoatAirpods from "../categories-image/boat airpods.webp";
import mainBoltAce from "../categories-image/bollt ace5g.webp";
import mainBoltEvo from "../categories-image/bolt evo.webp";
import mainClaimNow from "../categories-image/clsim now.webp";
import mainCreatorhood from "../categories-image/creatorhood.webp";
import mainFlight from "../categories-image/flight.webp";
import mainFlipkartPay from "../categories-image/flipkart pay.webp";
import mainOriginals from "../categories-image/flipkart originals.jpg";
import mainGenZ from "../categories-image/gens trend.webp";
import mainFitbit from "../categories-image/google fitbit air.webp";
import mainIphone from "../categories-image/iphone 18pro.webp";
import mainJoinBlack from "../categories-image/join black.webp";
import mainNoiseBand from "../categories-image/noise rep fitness band.webp";
import mainPersonalLoan from "../categories-image/personal loan.webp";
import mainSuperCoin from "../categories-image/super coin.webp";
import mainValue365 from "../categories-image/value 365.webp";
import mainLiveNow from "../categories-image/starts9 october.webp";
import mainSeller from "../categories-image/become a seller.webp";
import minutesIcon from "../../../assetsicon/bike icon.png";

const categories = [
  { name: "For You", image: sidebarForYou, href: "/" },
  { name: "Fashion", image: sidebarFashion, href: "/shop?category=fashion" },
  { name: "Mobiles", image: sidebarMobiles, href: "/shop?category=mobiles" },
  { name: "Appliances", image: sidebarAppliances, href: "/shop?category=appliances" },
  { name: "Electronics", image: sidebarElectronics, href: "/shop?category=electronics" },
  { name: "Smart Gadgets", image: sidebarGadgets, href: "/shop?category=wearables" },
  { name: "Home", image: sidebarHome, href: "/shop?category=home" },
  { name: "Beauty & Personal Care", image: sidebarBeauty, href: "/shop?category=beauty" },
  { name: "Toys & Baby Care", image: sidebarToys, href: "/shop?category=toys" },
  { name: "Food & Healthcare", image: sidebarFood, href: "/shop?category=grocery" },
  { name: "Sports & Fitness", image: sidebarSports, href: "/shop?category=sports" },
  { name: "Auto Accessories", image: sidebarAuto, href: "/shop?category=auto-accessories" },
  { name: "Pet Store", image: sidebarPets, href: "/shop?category=pets" },
  { name: "Furniture", image: sidebarFurniture, href: "/shop?category=furniture" },
  { name: "Books & Media", image: sidebarBooks, href: "/shop?category=books" },
  { name: "Bikes & Scooters", image: sidebarBikes, href: "/shop?category=two-wheelers" },
  { name: "Travel", image: sidebarTravel, href: "/shop?category=travel" },
  { name: "Gift Cards", image: sidebarGiftCards, href: "/gift-cards" },
  { name: "Sell Old Devices", image: sidebarSellDevices, href: "/shop" },
  { name: "Software & Games", image: sidebarGames, href: "/shop?category=gaming" },
];

const sections = [
  {
    title: "Popular Store",
    tiles: [
      { name: "Live now", image: mainLiveNow, href: "/shop" },
      { name: "Discover Luxe", image: mainOriginals, href: "/shop" },
      { name: "Value 365", image: mainValue365, href: "/shop" },
      { name: "Flights", image: mainFlight, href: "/shop?category=travel" },
      { name: "Flipkart Minutes", image: minutesIcon, href: "/categories" },
    ],
  },
  {
    title: "New & Upcoming Launches",
    tiles: [
      { name: "Google Fitbit Air", badge: "SALE IS LIVE", image: mainFitbit, href: "/shop?category=wearables" },
      { name: "iPhone 18 Pro", badge: "BUY NOW", image: mainIphone, href: "/shop?category=mobiles" },
      { name: "Boat AirPods", badge: "BUY NOW", image: mainBoatAirpods, href: "/shop?category=audio" },
      { name: "Acer Iconia Tab", badge: "BUY NOW", image: mainAcerTab, href: "/shop?category=tablets" },
      { name: "Noise Rep Fitness Band", badge: "SALE IS LIVE", image: mainNoiseBand, href: "/shop?category=wearables" },
      { name: "Acer Air Fryers", badge: "SALE IS LIVE", image: mainAirFryers, href: "/shop?category=appliances" },
      { name: "Bolt Evo", badge: "BUY NOW", image: mainBoltEvo, href: "/shop?category=mobiles" },
      { name: "Bolt Ace 5G", badge: "BUY NOW", image: mainBoltAce, href: "/shop?category=mobiles" },
      { name: "View All", viewAll: true, href: "/shop" },
    ],
  },
  {
    title: "Have you tried?",
    tiles: [
      { name: "Claim Now", image: mainClaimNow, href: "/shop" },
      { name: "SuperCoin", image: mainSuperCoin, href: "/shop" },
      { name: "Join BL̄ACK", image: mainJoinBlack, href: "/shop" },
      { name: "Bills & Recharges", image: mainBills, href: "/shop" },
      { name: "Flipkart Pay", image: mainFlipkartPay, href: "/shop" },
      { name: "Flipkart Axis Bank Credit Card", badge: "APPLY NOW", image: mainAxisCard, href: "/shop" },
      { name: "Creatorhood", badge: "EARN NOW", image: mainCreatorhood, href: "/shop" },
      { name: "Personal Loan", image: mainPersonalLoan, href: "/shop" },
      { name: "GenZ trends", image: mainGenZ, href: "/shop" },
      { name: "Become a Seller", image: mainSeller, href: "/seller" },
      { name: "View All", viewAll: true, href: "/shop" },
    ],
  },
];

function MobileCategoriesView() {
  const dispatch = useDispatch();
  const [activeCategory, setActiveCategory] = useState("For You");
  const [selectedPromo, setSelectedPromo] = useState(null);
  const { products = [], productsLoaded, loadingProducts, error } = useSelector((state) => state.products);
  const goBack = useAppBack('/')

  useEffect(() => {
    if (!productsLoaded && !loadingProducts) dispatch(fetchProducts());
  }, [dispatch, loadingProducts, productsLoaded]);

  const recentlyViewedItems = [
    { name: "Mobiles", match: /mobile|phone/i, image: sidebarMobiles, href: "/shop?category=mobiles" },
    { name: "Men's Jeans", match: /jean/i, image: sidebarFashion, href: "/shop?category=fashion" },
    { name: "Casual Shirts", match: /shirt/i, image: sidebarFashion, href: "/shop?category=fashion" },
  ].map((item) => {
    const product = products.find((entry) => item.match.test(`${entry.title?.shortTitle || ""} ${entry.title?.longTitle || ""}`));
    return {
      ...item,
      image: product?.detailUrl || item.image,
      href: product?._id ? `/product/${product._id}` : item.href,
    };
  });
  const activeCategoryProducts = getMobileCategoryProducts(products, activeCategory);

  return (
    <div className="mobile-categories-screen">
      <header className="mobile-categories-header">
        <button
          type="button"
          onClick={goBack}
          aria-label="Go back"
          className="mobile-categories-back-button"
        >
          <ArrowLeft size={23} />
        </button>
        <h1 className="mobile-categories-title">
          All Categories
        </h1>
        <Link to="/search" aria-label="Search" className="mobile-categories-header-action">
          <Search size={22} />
        </Link>
        <Link to="/cart" aria-label="Cart" className="mobile-categories-header-action">
          <ShoppingCart size={22} />
        </Link>
      </header>

      <div className="mobile-categories-body">
        <nav className="mobile-categories-sidebar" aria-label="Shop categories">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => {
                setActiveCategory(category.name)
                setSelectedPromo(null)
              }}
              className={`mobile-category-link${activeCategory === category.name ? " is-selected" : ""}`}
              aria-pressed={activeCategory === category.name}
            >
              <img src={category.image} alt="" loading="lazy" />
              <span>{category.name}</span>
            </button>
          ))}
        </nav>

        <main className="mobile-categories-content">
          {activeCategory === "For You" ? selectedPromo ? (
            <section className="mobile-category-section mobile-category-products">
              <div className="mobile-promo-products-heading">
                <button type="button" onClick={() => setSelectedPromo(null)}>‹ For You</button>
                <h2>{selectedPromo.name}</h2>
              </div>
              {loadingProducts && products.length === 0 ? (
                <p className="mobile-category-products__state" role="status">Loading products…</p>
              ) : error && products.length === 0 ? (
                <div className="mobile-category-products__state" role="alert">
                  <p>Products could not be loaded.</p>
                  <button type="button" onClick={() => dispatch(fetchProducts())}>Retry</button>
                </div>
              ) : products.length === 0 ? (
                <p className="mobile-category-products__state" role="status">No products are available right now.</p>
              ) : (
                <div className="mobile-category-products__grid">
                  {getMobilePromoProducts(products, selectedPromo.name).map(product => (
                    <Link key={product._id} to={`/product/${product._id}`} className="mobile-category-product">
                      <span className="mobile-category-product__image">
                        <img src={product.detailUrl} alt={product.title?.shortTitle || "Product"} loading="lazy" />
                      </span>
                      <strong>{product.title?.shortTitle || product.title?.longTitle || "Product"}</strong>
                      <span className="mobile-category-product__price">₹{Number(product.price?.cost || 0).toLocaleString("en-IN")}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ) : <>
            {sections.map((section, index) => (
              <Fragment key={section.title}>
                <section className="mobile-category-section">
                  <h2>{section.title}</h2>
                  <div className="mobile-category-tile-grid">
                    {section.tiles.map((tile) => (
                      <Link
                        key={tile.name}
                        to={tile.href}
                        className={`mobile-category-tile${tile.viewAll ? " mobile-category-tile--view-all" : ""}`}
                        onClick={event => {
                          event.preventDefault()
                          setSelectedPromo(tile)
                        }}
                      >
                        <span className="mobile-category-tile__image">
                          {tile.viewAll ? <ArrowDown size={32} aria-hidden="true" /> : <img src={tile.image} alt="" loading="lazy" />}
                        </span>
                        {tile.badge && (
                          <span className="mobile-category-tile__badge">
                            {tile.badge}
                          </span>
                        )}
                        <span className="mobile-category-tile__label">{tile.name}</span>
                      </Link>
                    ))}
                  </div>
                </section>
                {index === 1 && <section className="mobile-category-section mobile-recently-viewed">
                  <h2>Recently Viewed Stores</h2>
                  <div className="mobile-recently-viewed__track">
                    {recentlyViewedItems.map((item) => (
                      <Link key={item.name} to={item.href} className="mobile-recently-viewed__card">
                        <img src={item.image} alt="" loading="lazy" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </section>}
              </Fragment>
            ))}
          </> : (
            <section className="mobile-category-section mobile-category-products">
              <h2>{activeCategory}</h2>
              {loadingProducts && products.length === 0 ? (
                <p className="mobile-category-products__state" role="status">Loading products…</p>
              ) : error && products.length === 0 ? (
                <div className="mobile-category-products__state" role="alert">
                  <p>Products could not be loaded.</p>
                  <button type="button" onClick={() => dispatch(fetchProducts())}>Retry</button>
                </div>
              ) : products.length === 0 ? (
                <p className="mobile-category-products__state" role="status">No products are available right now.</p>
              ) : (
                <div className="mobile-category-products__grid">
                  {activeCategoryProducts.map(product => (
                    <Link key={product._id} to={`/product/${product._id}`} className="mobile-category-product">
                      <span className="mobile-category-product__image">
                        <img src={product.detailUrl} alt={product.title?.shortTitle || "Product"} loading="lazy" />
                      </span>
                      <strong>{product.title?.shortTitle || product.title?.longTitle || "Product"}</strong>
                      <span className="mobile-category-product__price">₹{Number(product.price?.cost || 0).toLocaleString("en-IN")}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default MobileCategoriesView;
