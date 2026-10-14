import { auth, sendPhoneOtp, verifyPhoneOtp } from '../firebase'

export const firebaseSendPhoneOtp = async (phoneNumber) => {
  const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber.replace(/\D/g, '').slice(0, 10)}`
  return await sendPhoneOtp(formatted)
}

export const firebaseVerifyPhoneOtp = async (confirmationResult, otp) => {
  return await verifyPhoneOtp(confirmationResult, otp)
}

export const firebaseGetCurrentUser = () => auth.currentUser
