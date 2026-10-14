import { initializeApp } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const hasRequiredFirebaseConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
].every(Boolean)

const app = hasRequiredFirebaseConfig ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null

export const setupRecaptcha = (containerId = 'firebase-recaptcha-container') => {
  if (!auth) return null

  const existingVerifier = window.recaptchaVerifier
  if (existingVerifier) {
    return existingVerifier
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    'expired-callback': () => {
      window.recaptchaVerifier = null
    },
  })

  window.recaptchaVerifier = verifier
  return verifier
}

export const sendPhoneOtp = async (phoneNumber) => {
  if (!auth) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* values to the client .env file.')
  }
  const verifier = setupRecaptcha()
  const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier)
  return confirmation
}

export const verifyPhoneOtp = async (confirmationResult, otpCode) => {
  const result = await confirmationResult.confirm(otpCode)
  return result.user
}
