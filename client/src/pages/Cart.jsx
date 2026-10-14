import React, { useEffect, useState } from 'react'
import Header from '../components/Header/Header'
import "./css/cart.css"
import Footer from '../components/Footer/Footer'
import { useDispatch, useSelector } from "react-redux"
import { placeOrderApi, toPaymentGateway } from '../service/Api'
import { useNavigate } from 'react-router-dom'
import { addToCart, removeFromCart } from '../redux/features/CartSlice'
import toast from "react-hot-toast"
import { useDataContextProvider } from '../context/DataProvider'
import { fetchProducts } from '../redux/features/ProductSlice'
import { ArrowLeft, Save, ShoppingCart, Trash2, Zap } from 'lucide-react'

const Cart = () => {

  let totalQuantity = 0
  const { user, authenticated } = useSelector(state => state.user)
  const { products = [], productsLoaded, loadingProducts } = useSelector(state => state.products)
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const { setLoginForm, setCheckoutLogin } = useDataContextProvider()

  const [loading, setLoading] = useState(false);

  const [cartCalculations, setCartCalculations] = useState({
    totalCost: 0,
    totalDiscount: 0,
    totalMrp: 0
  })

  const { cartItems } = useSelector(state => state.cart)

  useEffect(() => {
    if (!productsLoaded && !loadingProducts) dispatch(fetchProducts())
  }, [dispatch, productsLoaded, loadingProducts])

  const cartCount = cartItems.reduce((count, product) => count + product.quantity, 0)
  const suggestedProducts = products.slice(0, 8)

  const openLogin = () => {
    setCheckoutLogin(true)
    setLoginForm(true)
  }

  const addSuggestedProduct = (product) => {
    dispatch(addToCart({ product, quantity: 1 }))
    toast.success('Added to cart')
  }

  useEffect(() => {
    let totalCost = 0
    let totalDiscount = 0
    let totalMrp = 0

    cartItems.forEach((product) => {
      totalCost = product.price.cost * product.quantity + totalCost
      totalMrp = product.price.mrp * product.quantity + totalMrp
      totalDiscount = totalMrp - totalCost
    })

    setCartCalculations(prev => ({
      ...prev,
      totalCost: totalCost,
      totalDiscount: totalDiscount,
      totalMrp: totalMrp
    }))

  }, [cartItems])

  const placeOrder = async () => {
    const isauthenticated = authenticated
    if (!isauthenticated) {
      toast.error('Please login to place an order!')
      return
    }
    setLoading(true);
    const orderId = await placeOrderApi(cartItems, cartCalculations.totalCost, user._id)
    const travelLink = await toPaymentGateway(orderId)
    window.location.href = travelLink
  };

  const removeCartItem = (id) => {
    dispatch(removeFromCart(id))
     toast.error('Item removed from cart')
  }


  const changeQuantity = (e, product) => {
    if (e.target.name === "add") {
      dispatch(addToCart({ product: product, quantity: product.quantity + 1 }))
    } else {
      if (product.quantity <= 1) {
        return
      }
      dispatch(addToCart({ product: product, quantity: product.quantity - 1 }))
    }
  } 

  return (
    <>
      <Header />
      <div className="cart-mobile-layout">
        <header className="cart-mobile-heading">
          <button type="button" aria-label="Go back" onClick={() => navigate(-1)}><ArrowLeft /></button>
          <h1>My Cart</h1>
        </header>
        <nav className="cart-mobile-tabs" aria-label="Cart categories">
          <button type="button" className="active">Flipkart{authenticated && cartCount > 0 ? ` (${cartCount})` : ''}</button>
          <button type="button">{authenticated ? 'Minutes/Grocery (2)' : 'Grocery'}</button>
        </nav>

        {!authenticated ? (
          <>
            <section className="cart-missing-state">
              <span className="cart-missing-illustration" aria-hidden="true">
                <ShoppingCart className="cart-missing-icon" />
                <span className="cart-missing-face"><i /><i /><b /></span>
              </span>
              <h2>Missing Cart items?</h2>
              <button className="cart-login-button" type="button" onClick={openLogin}>Login</button>
              <button className="cart-continue-button" type="button" onClick={() => navigate('/')}>Continue Shopping</button>
            </section>
            <section className="cart-suggestions">
              <h2>Suggested for You</h2>
              <p>Based on Your Activity</p>
              <div className="cart-suggestion-track">
                {suggestedProducts.map(product => (
                  <article className="cart-suggestion-card" key={product._id}>
                    <img className="cart-suggestion-image" src={product.detailUrl} alt={product.title?.shortTitle || 'Suggested product'} />
                    <p className="cart-suggestion-title">{product.title?.shortTitle || product.title?.longTitle}</p>
                    <div className="cart-suggestion-prices">
                      <strong>₹{product.price.cost.toLocaleString('en-IN')}</strong>
                      <del>₹{product.price.mrp.toLocaleString('en-IN')}</del>
                    </div>
                    <p className="cart-suggestion-discount">{product.price.discount} off <span>🛡 Assured</span></p>
                    <button type="button" onClick={() => addSuggestedProduct(product)}>Add to cart</button>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : cartItems.length > 0 ? (
          <>
            <section className="cart-mobile-address">
              <div>
                <p>Deliver to: <strong>{user?.name || 'Customer'}, 110053</strong><span>HOME</span></p>
                <small>{typeof user?.address === 'string' ? user.address : 'Select your delivery address'}</small>
              </div>
              <button type="button" onClick={() => toast('Address selection is not available yet')}>Change</button>
            </section>
            <section className="cart-mobile-items">
              {cartItems.map(product => (
                <article className="cart-mobile-item" key={product._id}>
                  <p className="cart-lowest-price">Lowest Price since Launch</p>
                  <div className="cart-mobile-product">
                    <img src={product.detailUrl} alt={product.title?.shortTitle || product.title?.longTitle || 'Cart product'} />
                    <div className="cart-mobile-product-info">
                      <h2>{product.title?.shortTitle || product.title?.longTitle}</h2>
                      {product.size && <p className="cart-product-size">Size: {product.size}</p>}
                      <p className="cart-product-rating"><span>★★★★<i>★</i></span> <strong>4.0</strong> · (75) <b><img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_9e47c1.png" alt="Assured" /></b></p>
                    </div>
                  </div>
                  <div className="cart-mobile-price-line">
                    <label className="cart-quantity-select">Qty:
                      <select value={product.quantity} onChange={event => dispatch(addToCart({ product, quantity: Number(event.target.value) }))}>
                        {Array.from({ length: 10 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
                      </select>
                    </label>
                    <span className="cart-discount-mobile">↓{product.price.discount}</span>
                    <del>₹{product.price.mrp.toLocaleString('en-IN')}</del>
                    <strong>₹{product.price.cost.toLocaleString('en-IN')}</strong>
                  </div>
                  <p className="cart-mobile-delivery-date">Delivery by Oct 12, Mon</p>
                  <div className="cart-mobile-item-actions">
                    <button type="button" onClick={() => toast('Saved for later') }><Save /> Save for later</button>
                    <button type="button" onClick={() => removeCartItem(product._id)}><Trash2 /> Remove</button>
                    <button type="button" onClick={placeOrder}><Zap /> Buy this now</button>
                  </div>
                </article>
              ))}
            </section>
            <div className="cart-mobile-orderbar">
              <p><span>◉</span> You'll save <strong>₹{cartCalculations.totalDiscount.toLocaleString('en-IN')}</strong> on this order!</p>
              <div>
                <span className="cart-order-total">
                  <del>₹{cartCalculations.totalMrp.toLocaleString('en-IN')}</del>
                  <strong>₹{cartCalculations.totalCost.toLocaleString('en-IN')}</strong>
                </span>
                <button type="button" onClick={placeOrder}>{loading ? 'Processing…' : 'Place Order'}</button>
              </div>
            </div>
          </>
        ) : (
          <section className="cart-signed-in-empty">
            <ShoppingCart aria-hidden="true" />
            <h2>Your cart is empty</h2>
            <button type="button" onClick={() => navigate('/')}>Continue Shopping</button>
          </section>
        )}
      </div>
      <div className="cart-desktop-layout">
      {
        cartItems.length > 0 ?
          (
            <div className="cart-page-wrapper">
              <div className="product-cart">
                <div className="cart-left">
                  <div className="delivery-address">
                    <div className="address-label">
                      <p>Deliver to: <strong>Dharamasala - 176215</strong></p>
                    </div>
                    <button className="change-btn">Change</button>
                  </div>
                  <div className="cart-prodcuts">

                    {cartItems.map((product) => {
                      return (
                        <React.Fragment key={product._id}>
                          <div className="cart-product">
                            <div className="cart-product-image">
                              <img src={product.detailUrl} alt="product-image" />
                            </div>
                            <div className="cart-product-details">
                              <p className='product-title'>{product.title.longTitle}</p>
                              <div className="seller-info">
                                <p>Seller:SURASHAS</p>
                                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_9e47c1.png" alt="assured" />
                              </div>
                              <div className="price-of-product">
                                <span className='original-price'>{product.price.mrp.toLocaleString('en-IN')}</span>
                                <span className='discounted-price'>{product.price.cost.toLocaleString('en-IN')}</span>
                                <span className='discount-percentage'>{product.price.discount} Off</span>
                              </div>
                              <span className='offers-applied'>2 offers applied</span>
                            </div>
                            <div className="delivery-date">
                              <p>Delivery by Tue Dec 9</p>
                            </div>
                          </div>
                          <div className="cart-product-buttons">
                            <div className="quantity-buttons">
                              <button name='sub' onClick={(e) => changeQuantity(e, product)}>-</button>
                              <input type="text" value={product.quantity} readOnly />
                              <button name='add' onClick={(e) => changeQuantity(e, product)}>+</button>
                            </div>
                            <button className="action-btn" onClick={() => removeCartItem(product._id)}>REMOVE</button>
                          </div>
                        </React.Fragment>
                      )
                    })}
                  </div>
                  <div className="order-placement-button">
                    <button onClick={() => placeOrder()}> {loading ? <div className="spinner-border text-light" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                      :
                      <p>PLACE ORDER</p>
                    }</button>
                  </div>
                </div>

                <div className="cart-right">
                  <div className="price-heading">
                    <p>PRICE DETAILS</p>
                  </div>
                  <div className="price-calculations">
                    <div className="cart-price-calculation">
                      {cartItems.forEach((product) => {
                        totalQuantity = totalQuantity + product.quantity
                      })}
                      <p>Price ({totalQuantity} {totalQuantity <= 1 ? "item" : "items"})</p>
                      <p>₹{cartCalculations.totalMrp.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="cart-price-calculation">
                      <p>Discount</p>
                      <p className='cart-green'>- ₹{cartCalculations.totalDiscount.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="cart-price-calculation">
                      <p>Delivery Charges</p>
                      <p className='cart-green'>Free</p>
                    </div>
                  </div>
                  <div className="total-amount-calculated cart-price-calculation">
                    <p>Total Amount</p>
                    <p>₹{cartCalculations.totalCost.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="saving-by-customer cart-green">
                    <p>You will save ₹{cartCalculations.totalDiscount.toLocaleString('en-IN')} on this order</p>
                  </div>
                  <div className="safe-payment">
                    <div className="icon-shield">
                      <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/shield_b33c0c.svg" alt="shield" />
                    </div>
                    <p>Safe and Secure Payments.Easy returns.100% Authentic products.</p>
                  </div>
                </div>
              </div>
            </div>
          )
          :
          (<div className="cart-page">
            <div className="empty-cart">
              <div className="empty-cart-image">
                <img src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90" alt="" />
              </div>
              <div className="empty-cart-text">
                <p>Your cart is empty!</p>
                <p>Add items to it now.</p>
              </div>
              <div className="empty-cart-buttons">
                <button onClick={() => navigate("/")}>Shop now</button>
              </div>
            </div>
          </div>)
      }
          </div>
      <div className="cart-page-footer"><Footer /></div>
    </>
  )
}

export default Cart