import React, { useEffect, useState } from 'react'
import "./LoginSignup.css"
import { useDataContextProvider } from '../../context/DataProvider';
import { useDispatch, useSelector } from 'react-redux';
import { firebasePhoneLogin, loginUser, signUpUser, VerifyOtp } from '../../redux/features/UserSlice';
import { SendOtp, SendSignupOtp, SendFirebaseOtp, VerifyFirebaseOtp } from '../../service/Api';
import toast from "react-hot-toast"
import { X } from 'lucide-react'
import flipkartIcon from '../../../../assetsicon/flipkart icon.png'
import flipkartText from '../../../../assetsicon/flipkart text.png'

const DEMO_USER = {
    name: 'Demo User',
    email: 'demo@flipkartclone.com',
    username: 'demo-user',
    phone: '9876543210',
    password: 'Demo@123'
}

const getLoginErrorMessage = error => typeof error === 'string'
    ? error
    : error.response?.data?.message || error.message || 'Login failed. Try again.'

const LoginSignup = () => {

    const { setLoginForm, checkoutLogin, setCheckoutLogin } = useDataContextProvider();

    const dispatch = useDispatch();

    const toggleForm = () => {
        setLoginForm(false)
        setCheckoutLogin(false)
    }

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
        phone: "",
    })

    const [signupData, setSignupData] = useState({
        name: "",
        email: "",
        username: "",
        password: "",
        phone: ""
    })

    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [useEmailLogin, setUseEmailLogin] = useState(true);
    const [usePasswordLogin, setUsePasswordLogin] = useState(false);
    const [otpIdentifier, setOtpIdentifier] = useState(null);
        const [otpPurpose, setOtpPurpose] = useState('login');
    const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
    const [otpCountdown, setOtpCountdown] = useState(30);

    const onInputChange = (e) => {
        const value = e.target.name === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value
        const newData = { ...signupData, [e.target.name]: value };
        setSignupData(newData);
    };

    const onloginInputChange = (e) => {
        const value = e.target.name === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value
        const newData = { ...loginData, [e.target.name]: value };
        setLoginData(newData);
    };

    // when page changed (from Login to Signup)

    const changeForm = () => {
        setSignupData({
            name: "",
            email: "",
            username: "",
            password: "",
            phone: ""
        })
        setLoginData({
            email: "",
            password: "",
            phone: "",
        })
        setUseEmailLogin(true)
        setUsePasswordLogin(false)

        if (form === "login") {
            setForm("signup")
        } else {
            setForm("login")
        }
    }

    const { user } = useSelector(state => state.user)

    const handleDemoLogin = async () => {
        const demoCredentials = {
            email: DEMO_USER.email,
            password: DEMO_USER.password
        }

        setLoginData((prev) => ({
            ...prev,
            email: demoCredentials.email,
            password: demoCredentials.password,
            phone: DEMO_USER.phone
        }))

        try {
            setLoading(true)
            await dispatch(loginUser(demoCredentials)).unwrap()
            toast.success('Demo login successful!')
        } catch (error) {
            toast.error(getLoginErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const loghimin = async () => {
        if (!loginData.email || !loginData.password) {
            toast.error('Please fill in all fields')
            return
        }
        try {
            setLoading(true);
            await dispatch(loginUser(loginData)).unwrap()
            toast.success('Logged in successfully!')
            setLoading(false);
        } catch (error) {
            toast.error(getLoginErrorMessage(error))
            setLoading(false);
        }
    }

    const signupHandeler = async () => {
        if (!signupData.email || !signupData.name || !signupData.password || !signupData.phone || !signupData.username) {
            toast.error('Please fill in all fields')
            return
        }
        try {
            setLoading(true);
            await SendSignupOtp(signupData)
            setOtpPurpose('signup')
            setOtpIdentifier({ email: signupData.email })
            setOtpDigits(Array(6).fill(''))
            setOtpCountdown(30)
            setForm('otp')
            toast.success('Verification code sent to your email')
            setLoading(false);
        } catch (error) {
            const message = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
                ? 'Signup verification request timed out. Please try again.'
                : error.response?.data?.message || error.message || 'Could not send verification code. Try again.'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            setLoginForm(false)
            setCheckoutLogin(false)
        }
    }, [user, setCheckoutLogin, setLoginForm])

    const [form, setForm] = useState("login")

    let content;

    const inputRef = React.useRef([])

    if (form === "otp") {
        inputRef.current = []
    }

    useEffect(() => {
        if (form !== 'otp' || otpCountdown <= 0) return undefined
        const timer = window.setTimeout(() => setOtpCountdown(value => value - 1), 1000)
        return () => window.clearTimeout(timer)
    }, [form, otpCountdown])

    const handleInput = (e, index) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(-1)
        setOtpDigits(current => current.map((digit, digitIndex) => digitIndex === index ? e.target.value : digit))
        if (e.target.value.length > 0 && index < inputRef.current.length - 1) {
            inputRef.current[index + 1].focus()
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && e.target.value === "" && index > 0) {
            inputRef.current[index - 1].focus()
        }
        if (e.key === "Backspace" && e.target.value !== "") {
            setOtpDigits(current => current.map((digit, digitIndex) => digitIndex === index ? '' : digit))
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        const pasteArray = paste.split('');
        setOtpDigits(Array.from({ length: 6 }, (_, index) => pasteArray[index] || ''))
        pasteArray.forEach((char, index) => {
            if (inputRef.current[index]) {
                inputRef.current[index].value = char;
            }
        });
        inputRef.current[Math.min(pasteArray.length, inputRef.current.length - 1)]?.focus()
    }

    const reqOtp = async (identifier) => {
        const otpTarget = typeof identifier === 'string' ? { email: identifier } : identifier
        if (!otpTarget?.email && !otpTarget?.phone) {
            toast.error("Enter your email or phone number")
            return
        }
        try {
            setOtpLoading(true);
            setOtpPurpose('login')

            const firebaseResult = await SendFirebaseOtp(otpTarget)

            if (firebaseResult?.mode === 'phone') {
                setOtpIdentifier({ ...otpTarget, confirmationResult: firebaseResult.confirmationResult })
                setOtpDigits(Array(6).fill(''))
                toast.success('SMS OTP sent via Firebase!')
                setOtpCountdown(30)
                setForm('otp')
                return
            }

            setOtpIdentifier(otpTarget)
            setOtpDigits(Array(6).fill(''))
            toast.success(otpTarget.phone ? "Code sent to the email registered with this number" : "OTP sent to your email!")
            setOtpCountdown(30)
            setForm("otp")
        } catch (error) {
            const message = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
                ? 'OTP request timed out. Please try again.'
                : error.response?.data?.message || error.message || "Failed to send OTP. Try again."
            toast.error(message)
        } finally {
            setOtpLoading(false)
        }
    }

    const checkOtp = async () => {
        setLoading(true);
        const otp = otpDigits.join('')

        if (otp.length < 6) {
            toast.error("Please enter the complete 6-digit OTP")
            setLoading(false)
            return
        }
        try {
            if (otpPurpose === 'signup') {
                await dispatch(signUpUser({ ...signupData, otp })).unwrap()
                toast.success('Email verified! Account created.')
                setLoading(false)
                return
            }

            const firebaseConfirmation = otpIdentifier?.confirmationResult
            if (firebaseConfirmation) {
                const firebaseUser = await VerifyFirebaseOtp(firebaseConfirmation, otp)
                const firebaseIdToken = await firebaseUser.getIdToken()
                await dispatch(firebasePhoneLogin(firebaseIdToken)).unwrap()
                toast.success('Firebase OTP verified! Logging you in...')
                setLoading(false)
                return
            }

            await dispatch(VerifyOtp({ ...(otpIdentifier || { email: loginData.email }), otp })).unwrap()
            toast.success('OTP Verified! Logging you in...')
            setLoading(false);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Invalid OTP. Please try again.')
            setLoading(false);
        }
    }

    if (form === "login") {
        content = checkoutLogin ? <div className="checkout-auth-content">
            <div className="demo-login-box">
                <span>Demo login</span>
                <strong>{DEMO_USER.email}</strong>
                <small>Password: {DEMO_USER.password}</small>
            </div>
            {usePasswordLogin ? <>
                <div className="email-number-input-wrap">
                    <label htmlFor="checkout-password-email">Email ID</label>
                    <input id="checkout-password-email" value={loginData.email} onChange={onloginInputChange} type="email" placeholder="" name="email" autoComplete="email" />
                </div>
                <div className="email-number-input-wrap">
                    <label htmlFor="checkout-password">Password</label>
                    <input id="checkout-password" value={loginData.password} onChange={onloginInputChange} type="password" placeholder="" name="password" autoComplete="current-password" />
                </div>
                <button className="checkout-auth-primary" type="button" onClick={loghimin} disabled={loading || !loginData.email || !loginData.password}>
                    {loading ? <span className="spinner-border spinner-border-sm" role="status" /> : 'Log in'}
                </button>
            </> : useEmailLogin ? <>
                <div className="email-number-input-wrap">
                    <label htmlFor="checkout-email">Email ID</label>
                    <input id="checkout-email" value={loginData.email} onChange={onloginInputChange} type="email" placeholder="" name="email" autoComplete="email" />
                </div>
            </> : <>
                <div className="phone-number-field">
                    <label className="phone-number-floating-label" htmlFor="checkout-phone">Phone Number</label>
                    <div className="phone-number-input-wrap"><span>+91</span><input id="checkout-phone" value={loginData.phone} onChange={onloginInputChange} type="tel" inputMode="numeric" placeholder="" name="phone" autoComplete="tel-national" maxLength={10} /></div>
                </div>
            </>}
            {!usePasswordLogin && <button className="checkout-auth-text-button" type="button" onClick={() => setUseEmailLogin(!useEmailLogin)}>
                {useEmailLogin ? 'Use Phone Number' : 'Use Email-ID'}
            </button>}
            <button className="demo-login-button" type="button" onClick={handleDemoLogin} disabled={loading}>
                {loading ? 'Logging in...' : 'Use Demo Login'}
            </button>
            <p className="checkout-auth-terms">By continuing, you confirm that you are above 18 years of age, and you agree to Flipkart's <a href="#terms">Terms of Use</a> and <a href="#privacy">Privacy Policy</a>.</p>
            {!usePasswordLogin && <div className="checkout-auth-footer">
                <button className="checkout-auth-primary" type="button" onClick={() => reqOtp(useEmailLogin ? { email: loginData.email } : { phone: loginData.phone })} disabled={loading || otpLoading || (useEmailLogin ? !loginData.email : loginData.phone.length !== 10)}>
                    {loading || otpLoading ? <span className="spinner-border spinner-border-sm" role="status" /> : 'Continue'}
                </button>
            </div>}
        </div> : <div className="right-section">
            <div className="input-section">
                <input value={loginData.email} onChange={onloginInputChange} type="email" placeholder='Enter Email' name='email' />
                <input value={loginData.password} onChange={onloginInputChange} type="password" placeholder='Enter Password' name='password' />
                <p>By continuing, you agree to Flipkart's Terms of Use and Privacy Policy.</p>
                <button onClick={loghimin} className='login-button'>{loading ? <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div> : "Login"}</button>
                <button type="button" className="demo-login-button demo-login-button--compact" onClick={handleDemoLogin} disabled={loading}>
                    {loading ? 'Logging in...' : 'Use Demo Login'}
                </button>
                <h6>OR</h6>
                <button className='otp-button' onClick={() => reqOtp(loginData.email)}>{otpLoading ? <div class="d-flex justify-content-center">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div> : "Request OTP"}</button>
            </div>
            <div className="input-text">
                <p onClick={changeForm}>New to FlipKart ? Create a account</p>
            </div>
            <div className="mobile-auth-content">
                <h3>Log in</h3>
                {usePasswordLogin ? <>
                    <label className="mobile-auth-field">
                        <span>Email ID</span>
                        <input value={loginData.email} onChange={onloginInputChange} type="email" placeholder="Enter email" name="email" autoComplete="email" />
                    </label>
                    <label className="mobile-auth-field">
                        <span>Password</span>
                        <input value={loginData.password} onChange={onloginInputChange} type="password" placeholder="Enter password" name="password" autoComplete="current-password" />
                    </label>
                    <button className="mobile-auth-primary" type="button" onClick={loghimin} disabled={loading || !loginData.email || !loginData.password}>
                        {loading ? 'Logging in…' : 'Log in'}
                    </button>
                </> : <>
                    {useEmailLogin ? (
                        <label className="mobile-auth-field">
                            <span>Email ID</span>
                            <input value={loginData.email} onChange={onloginInputChange} type="email" placeholder="Enter email" name="email" autoComplete="email" />
                        </label>
                    ) : (
                        <label className="mobile-auth-field">
                            <span>Mobile number</span>
                            <div className="mobile-auth-phone">
                                <span>+91</span>
                                <input value={loginData.phone} onChange={onloginInputChange} type="tel" inputMode="numeric" placeholder="Enter mobile number" name="phone" autoComplete="tel-national" maxLength={10} />
                            </div>
                        </label>
                    )}
                    <button
                        className="mobile-auth-primary"
                        type="button"
                        onClick={() => reqOtp(useEmailLogin ? { email: loginData.email } : { phone: loginData.phone })}
                        disabled={loading || otpLoading || (useEmailLogin ? !loginData.email : loginData.phone.length !== 10)}
                    >
                        {otpLoading ? 'Sending code…' : 'Continue'}
                    </button>
                    <button className="mobile-auth-link" type="button" onClick={() => setUseEmailLogin(value => !value)}>
                        {useEmailLogin ? 'Use mobile number instead' : 'Use email ID instead'}
                    </button>
                </>}
                <p className="mobile-auth-terms">By continuing, you agree to Flipkart&apos;s Terms of Use and Privacy Policy.</p>
                <button className="mobile-auth-link mobile-auth-create" type="button" onClick={changeForm}>New to Flipkart? Create an account</button>
            </div>
        </div>
    } if (form === "signup") {
        content = <div className="right-section" >
            <div className="signup-input-section">
                <input value={signupData.name} type="text" onChange={onInputChange} placeholder='Enter Your Name' name='name' />
                <input value={signupData.email} type="email" onChange={onInputChange} placeholder='Enter Email' name='email' />
                <input value={signupData.username} type="text" onChange={onInputChange} placeholder='Enter Username' name='username' />
                <input value={signupData.password} type="password" onChange={onInputChange} placeholder='Enter Password' name='password' />
                <input value={signupData.phone} type="tel" onChange={onInputChange} placeholder='Enter Phone' name='phone' />
                <button type="button" onClick={signupHandeler}> {loading ? <div class="d-flex justify-content-center">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div> : "Continue"}</button>
            </div>
            <div className="input-text">
                <p onClick={changeForm}>Already have account ? Log in</p>
            </div>
            <div className="mobile-auth-content">
                <h3>Create your account</h3>
                <label className="mobile-auth-field">
                    <span>Email ID</span>
                    <input value={signupData.email} type="email" onChange={onInputChange} placeholder="Enter email" name="email" autoComplete="email" />
                </label>
                <label className="mobile-auth-field">
                    <span>Mobile number</span>
                    <div className="mobile-auth-phone">
                        <span>+91</span>
                        <input value={signupData.phone} type="tel" inputMode="numeric" onChange={onInputChange} placeholder="Enter mobile number" name="phone" autoComplete="tel-national" maxLength={10} />
                    </div>
                </label>
                <label className="mobile-auth-field">
                    <span>Username</span>
                    <input value={signupData.username} type="text" onChange={onInputChange} placeholder="Choose a username" name="username" autoComplete="username" />
                </label>
                <label className="mobile-auth-field">
                    <span>Password</span>
                    <input value={signupData.password} type="password" onChange={onInputChange} placeholder="Create a password" name="password" autoComplete="new-password" />
                </label>
                <button className="mobile-auth-primary" type="button" onClick={signupHandeler} disabled={loading || !signupData.phone || !signupData.email || !signupData.name || !signupData.username || !signupData.password}>
                    {loading ? 'Sending code…' : 'Continue'}
                </button>
                <p className="mobile-auth-terms">We&apos;ll send a verification code to your email address.</p>
                <button className="mobile-auth-link mobile-auth-create" type="button" onClick={changeForm}>Already have an account? Log in</button>
            </div>
        </div>
    } if (form === "otp") {
        content = checkoutLogin ? <div className="checkout-otp-content">
            <p className="checkout-otp-prompt">Please enter the verification code for <strong>{otpIdentifier?.phone ? `+91 ${otpIdentifier.phone}` : otpIdentifier?.email || loginData.email}</strong> <button type="button" onClick={() => setForm('login')}>Edit</button></p>
            <div className="otp-fields checkout-otp-fields" onPaste={handlePaste}>
                {Array(6).fill(0).map((_, index) => (
                    <input value={otpDigits[index]} onKeyDown={(e) => handleKeyDown(e, index)} type="text" inputMode="numeric" pattern="[0-9]*" onChange={(e) => handleInput(e, index)} maxLength={1} key={index} required ref={e => inputRef.current[index] = e} />
                ))}
            </div>
            <p className="checkout-otp-note">{otpIdentifier?.confirmationResult ? 'The six-digit code was sent by SMS.' : otpIdentifier?.phone ? 'The code was sent to the email registered with this phone number.' : 'Check your inbox for the six-digit code.'} It expires in 5 minutes.</p>
            <div className="checkout-otp-resend">{otpCountdown > 0 ? `Resend code in 00:${String(otpCountdown).padStart(2, '0')}` : <button type="button" disabled={otpLoading} onClick={() => reqOtp(otpIdentifier)}>{otpLoading ? 'Sending...' : 'Resend code'}</button>}</div>
            <button className="checkout-auth-primary checkout-verify-button" type="button" onClick={checkOtp} disabled={loading || otpDigits.some(digit => !digit)}>
                {loading ? <span className="spinner-border spinner-border-sm" role="status" /> : 'Verify'}
            </button>
        </div> : <div className="right-section">
            <div className="otp-input">
                <p>{otpPurpose === 'signup' ? 'Enter the 6-digit code sent to your email' : otpIdentifier?.confirmationResult ? 'Enter the 6-digit SMS code' : 'Enter 6 digit OTP sent to your email'}</p>
                <div className="otp-fields" onPaste={handlePaste}>
                    {Array(6).fill(0).map((_, index) => (
                        <input onKeyDown={(e) => handleKeyDown(e, index)} type="text" onChange={(e) => handleInput(e, index)} maxLength={1} key={index} required ref={e => inputRef.current[index] = e} />
                    ))}
                </div>
                <button className='otp-submit-button' onClick={() => checkOtp(loginData.email)}>{loading ? <div class="d-flex justify-content-center">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div> : "Verify"}</button>
                <p className="resend-otp">Didn't receive the code? {otpCountdown > 0 ? `Resend in 00:${String(otpCountdown).padStart(2, '0')}` : <button type="button" disabled={otpLoading || loading} onClick={otpPurpose === 'signup' ? signupHandeler : () => reqOtp(otpIdentifier)}>{otpLoading || loading ? 'Sending...' : 'Resend'}</button>}</p>
            </div>
        </div>
    }
    return (
        <>
            <div className={`login-signup ${checkoutLogin ? 'checkout-login-overlay' : ''}`} onClick={toggleForm}>
                <div id="firebase-recaptcha-container" />
                {checkoutLogin && <header className="checkout-auth-brandbar">
                    <button type="button" aria-label="Close login" onClick={toggleForm}><X size={25} /></button>
                    <div><img className="checkout-flipkart-wordmark" src={flipkartText} alt="Flipkart" /><img className="checkout-flipkart-icon" src={flipkartIcon} alt="" /></div>
                </header>}
                <div className={`login-signup-container ${checkoutLogin ? 'checkout-login-container' : ''} ${checkoutLogin && form === 'otp' ? 'checkout-otp-container' : ''} ${!checkoutLogin && ['login', 'signup'].includes(form) ? 'auth-mobile-flow' : ''}`} onClick={(e) => e.stopPropagation()}>
                    {checkoutLogin ? <>
                        {form !== 'otp' && <header className="checkout-auth-heading">
                            <h2>{form === 'otp' ? 'Verify your email' : form === 'signup' ? 'Create your account' : 'Log in to complete your shopping'}</h2>
                            <p>{form === 'otp' ? 'A secure code keeps your account protected' : 'Shop and track your orders easily'}</p>
                        </header>}
                        {content}
                    </> : <>
                        <div className="left-section">
                            <div className="left-section-text">
                                {form === "login" || form === "otp" ? <h2>Login</h2> : <h2>Sign Up</h2>}
                                <p>Get access to your Orders, Wishlist and Recommendations</p>
                            </div>
                            <div className="left-section-image">
                                <img src={"https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/login_img_c4a81e.png"} alt="" />
                            </div>
                        </div>
                        {content}
                    </>}
                </div>
                {!checkoutLogin && <div onClick={toggleForm} className="cross">
                    <i className="fa-solid fa-xmark"></i>
                </div>}
            </div>
        </>
    )
}

export default LoginSignup