import { useEffect, useState } from 'react'
import {
    AdminCorsSettings,
    AdminSmtpSettings,
    SaveAdminCorsSettings,
    SaveAdminSmtpSettings,
    SendAdminSmtpTestEmail
} from '../service/OrderApi'
import './css/PaymentSettings.css'

const DEFAULT_OTP_SUBJECT = 'Flipkart - Verification Code'
const DEFAULT_OTP_TEMPLATE = 'Your verification code is {{otp}}.\nIt is valid for 5 minutes.'
const DEFAULT_SMTP_SETTINGS = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    password: '',
    senderEmail: '',
    otpEmailSubject: DEFAULT_OTP_SUBJECT,
    otpEmailTemplate: DEFAULT_OTP_TEMPLATE
}

const Settings = () => {
    const [smtpSettings, setSmtpSettings] = useState(DEFAULT_SMTP_SETTINGS)
    const [smtpPasswordConfigured, setSmtpPasswordConfigured] = useState(false)
    const [smtpLoading, setSmtpLoading] = useState(false)
    const [smtpSaving, setSmtpSaving] = useState(false)
    const [smtpTesting, setSmtpTesting] = useState(false)
    const [testEmail, setTestEmail] = useState('')
    const [smtpError, setSmtpError] = useState('')
    const [smtpMessage, setSmtpMessage] = useState('')
    const [corsOrigins, setCorsOrigins] = useState([''])
    const [corsLoading, setCorsLoading] = useState(false)
    const [corsSaving, setCorsSaving] = useState(false)
    const [corsError, setCorsError] = useState('')
    const [corsMessage, setCorsMessage] = useState('')

    const loadSmtpSettings = async () => {
        setSmtpLoading(true)
        setSmtpError('')
        setSmtpMessage('')
        try {
            const settings = await AdminSmtpSettings()
            setSmtpSettings({ ...DEFAULT_SMTP_SETTINGS, ...settings, password: '' })
            setSmtpPasswordConfigured(settings.passwordConfigured)
        } catch (requestError) {
            setSmtpError(requestError.response?.data?.message || 'Could not load SMTP settings.')
        } finally {
            setSmtpLoading(false)
        }
    }

    const loadCorsSettings = async () => {
        setCorsLoading(true)
        setCorsError('')
        setCorsMessage('')
        try {
            const origins = await AdminCorsSettings()
            setCorsOrigins(origins.length ? origins : [''])
        } catch (requestError) {
            setCorsError(requestError.response?.data?.message || 'Could not load CORS settings.')
        } finally {
            setCorsLoading(false)
        }
    }

    useEffect(() => {
        loadSmtpSettings()
        loadCorsSettings()
    }, [])

    const updateSmtpSetting = (key, value) => {
        setSmtpSettings(current => ({ ...current, [key]: value }))
    }

    const saveSmtpSettings = async () => {
        setSmtpSaving(true)
        setSmtpError('')
        setSmtpMessage('')
        try {
            const settings = await SaveAdminSmtpSettings(smtpSettings)
            setSmtpSettings({ ...DEFAULT_SMTP_SETTINGS, ...settings, password: '' })
            setSmtpPasswordConfigured(settings.passwordConfigured)
            setSmtpMessage('SMTP and OTP email settings saved.')
        } catch (requestError) {
            setSmtpError(requestError.response?.data?.message || 'Could not save SMTP settings.')
        } finally {
            setSmtpSaving(false)
        }
    }

    const sendTestEmail = async () => {
        setSmtpTesting(true)
        setSmtpError('')
        setSmtpMessage('')
        try {
            const message = await SendAdminSmtpTestEmail(testEmail)
            setSmtpMessage(message)
        } catch (requestError) {
            setSmtpError(requestError.response?.data?.message || 'Could not send the SMTP test email.')
        } finally {
            setSmtpTesting(false)
        }
    }

    const saveCorsSettings = async () => {
        setCorsSaving(true)
        setCorsError('')
        setCorsMessage('')
        try {
            const origins = await SaveAdminCorsSettings(corsOrigins.map(origin => origin.trim()).filter(Boolean))
            setCorsOrigins(origins.length ? origins : [''])
            setCorsMessage('CORS domains saved and applied to the backend.')
        } catch (requestError) {
            setCorsError(requestError.response?.data?.message || 'Could not save CORS settings.')
        } finally {
            setCorsSaving(false)
        }
    }

    const updateCorsOrigin = (index, value) => {
        setCorsOrigins(current => current.map((origin, originIndex) => originIndex === index ? value : origin))
    }

    return (
        <section className="payment-settings-page">
            <section className="payment-settings-list-section smtp-settings-section">
                <div className="payment-settings-list-heading">
                    <div>
                        <h3>Email SMTP settings</h3>
                        <p className="payment-settings-section-note">Configure the email server used for account verification and sign-in codes.</p>
                    </div>
                    <button type="button" onClick={loadSmtpSettings} disabled={smtpLoading}>{smtpLoading ? 'Refreshing…' : 'Refresh'}</button>
                </div>
                {smtpError && <p className="payment-settings-alert error" role="alert">{smtpError}</p>}
                {smtpMessage && <p className="payment-settings-alert success" role="status">{smtpMessage}</p>}
                <div className="smtp-settings-form">
                    <label>
                        <span>SMTP host</span>
                        <input value={smtpSettings.host} onChange={event => updateSmtpSetting('host', event.target.value)} autoComplete="off" />
                    </label>
                    <label>
                        <span>Port</span>
                        <input type="number" min="1" max="65535" value={smtpSettings.port} onChange={event => updateSmtpSetting('port', event.target.value)} />
                    </label>
                    <label className="smtp-settings-toggle">
                        <input type="checkbox" checked={smtpSettings.secure} onChange={event => updateSmtpSetting('secure', event.target.checked)} />
                        <span>Secure connection</span>
                    </label>
                    <label>
                        <span>SMTP username</span>
                        <input type="text" value={smtpSettings.user} onChange={event => updateSmtpSetting('user', event.target.value)} autoComplete="username" />
                    </label>
                    <label>
                        <span>SMTP password</span>
                        <input type="password" value={smtpSettings.password} onChange={event => updateSmtpSetting('password', event.target.value)} placeholder={smtpPasswordConfigured ? 'Saved; leave blank to keep' : 'Enter SMTP password'} autoComplete="new-password" />
                    </label>
                    <label>
                        <span>Sender email</span>
                        <input type="email" value={smtpSettings.senderEmail} onChange={event => updateSmtpSetting('senderEmail', event.target.value)} autoComplete="email" />
                    </label>
                    <label className="smtp-settings-template">
                        <span>OTP email subject</span>
                        <input value={smtpSettings.otpEmailSubject} onChange={event => updateSmtpSetting('otpEmailSubject', event.target.value)} maxLength={200} />
                    </label>
                    <label className="smtp-settings-template">
                        <span>OTP email content</span>
                        <textarea value={smtpSettings.otpEmailTemplate} onChange={event => updateSmtpSetting('otpEmailTemplate', event.target.value)} maxLength={5000} rows={5} />
                        <small>Use <code>{'{{otp}}'}</code> where the six-digit verification code should appear. This template is used for both login and signup.</small>
                    </label>
                </div>
                <div className="payment-settings-actions">
                    <span className="smtp-settings-password-status">{smtpPasswordConfigured ? 'Password saved' : 'Password not configured'}</span>
                    <button type="button" onClick={saveSmtpSettings} disabled={smtpSaving || smtpLoading}>{smtpSaving ? 'Saving…' : 'Save SMTP settings'}</button>
                </div>

                <div className="smtp-test-section">
                    <h4>Test email delivery</h4>
                    <p className="payment-settings-section-note">Save the SMTP settings first, then send a test email to verify that SMTP connection.</p>
                    <div className="smtp-test-form">
                        <label>
                            <span>Recipient email</span>
                            <input type="email" value={testEmail} onChange={event => setTestEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" />
                        </label>
                        <button type="button" onClick={sendTestEmail} disabled={smtpTesting || smtpLoading || smtpSaving || !testEmail.trim()}>
                            {smtpTesting ? 'Sending…' : 'Send test email'}
                        </button>
                    </div>
                </div>
            </section>

            <section className="payment-settings-list-section cors-settings-section">
                <div className="payment-settings-list-heading">
                    <div>
                        <h3>CORS allowed domains</h3>
                        <p className="payment-settings-section-note">Only listed website origins can call the API from a browser. Changes are saved in the database and applied immediately.</p>
                    </div>
                    <button type="button" onClick={loadCorsSettings} disabled={corsLoading}>{corsLoading ? 'Refreshing…' : 'Refresh'}</button>
                </div>
                {corsError && <p className="payment-settings-alert error" role="alert">{corsError}</p>}
                {corsMessage && <p className="payment-settings-alert success" role="status">{corsMessage}</p>}
                <div className="cors-settings-origins">
                    {corsOrigins.map((origin, index) => (
                        <div className="cors-settings-origin" key={`cors-origin-${index}`}>
                            <label>
                                <span>Domain {index + 1}</span>
                                <input
                                    type="text"
                                    value={origin}
                                    onChange={event => updateCorsOrigin(index, event.target.value)}
                                    placeholder="https://shop.example.com"
                                    autoComplete="url"
                                    maxLength={300}
                                />
                            </label>
                            <button
                                className="payment-settings-remove"
                                type="button"
                                onClick={() => setCorsOrigins(current => current.length > 1 ? current.filter((_, originIndex) => originIndex !== index) : [''])}
                                aria-label={`Remove domain ${index + 1}`}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
                <p className="payment-settings-section-note">Enter an origin such as <code>https://shop.example.com</code>; paths and wildcards are not allowed. Existing CLIENT_URL and ADMIN_URL values remain allowed.</p>
                <div className="payment-settings-actions">
                    <button className="secondary" type="button" onClick={() => setCorsOrigins(current => [...current, ''])} disabled={corsOrigins.length >= 100}>Add domain</button>
                    <button type="button" onClick={saveCorsSettings} disabled={corsSaving || corsLoading}>{corsSaving ? 'Saving…' : 'Save CORS domains'}</button>
                </div>
            </section>
        </section>
    )
}

export default Settings
