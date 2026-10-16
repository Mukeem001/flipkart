import { useEffect, useState } from 'react'
import { AdminCorsSettings, AdminSmtpSettings, AdminUpiOptions, SaveAdminCorsSettings, SaveAdminSmtpSettings, SaveAdminUpiOptions } from '../service/OrderApi'
import './css/PaymentSettings.css'

const PROVIDERS = [
    { value: 'google-pay', label: 'Google Pay' },
    { value: 'phonepe', label: 'PhonePe' },
    { value: 'paytm', label: 'Paytm' },
    { value: 'mobikwik', label: 'MobiKwik' }
]

const emptyOption = () => ({ provider: 'google-pay', label: 'Google Pay', upiId: '', enabled: true })

const PaymentSettings = () => {
    const [upiOptions, setUpiOptions] = useState([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [smtpSettings, setSmtpSettings] = useState({ host: 'smtp.gmail.com', port: 587, secure: false, user: '', password: '', senderEmail: '' })
    const [smtpPasswordConfigured, setSmtpPasswordConfigured] = useState(false)
    const [smtpLoading, setSmtpLoading] = useState(false)
    const [smtpSaving, setSmtpSaving] = useState(false)
    const [smtpError, setSmtpError] = useState('')
    const [smtpMessage, setSmtpMessage] = useState('')
    const [corsOrigins, setCorsOrigins] = useState([''])
    const [corsLoading, setCorsLoading] = useState(false)
    const [corsSaving, setCorsSaving] = useState(false)
    const [corsError, setCorsError] = useState('')
    const [corsMessage, setCorsMessage] = useState('')

    const loadOptions = async () => {
        setLoading(true)
        setError('')
        setMessage('')
        try {
            const options = await AdminUpiOptions()
            setUpiOptions(options.map(option => ({ ...option, id: option._id || option.id })))
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not load UPI settings.')
        } finally {
            setLoading(false)
        }
    }

    const loadSmtpSettings = async () => {
        setSmtpLoading(true)
        setSmtpError('')
        setSmtpMessage('')
        try {
            const settings = await AdminSmtpSettings()
            setSmtpSettings({ ...settings, password: '' })
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
        loadOptions()
        loadSmtpSettings()
        loadCorsSettings()
    }, [])

    const updateOption = (index, updates) => {
        setUpiOptions(current => current.map((option, optionIndex) => optionIndex === index ? { ...option, ...updates } : option))
    }

    const changeProvider = (index, provider) => {
        const providerLabel = PROVIDERS.find(option => option.value === provider)?.label || 'UPI App'
        updateOption(index, { provider, label: providerLabel })
    }

    const addOption = () => setUpiOptions(current => [...current, emptyOption()])

    const saveOptions = async () => {
        setSaving(true)
        setError('')
        setMessage('')
        try {
            const savedOptions = await SaveAdminUpiOptions(upiOptions)
            setUpiOptions(savedOptions.map(option => ({ ...option, id: option._id || option.id })))
            setMessage('UPI options saved.')
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not save UPI options.')
        } finally {
            setSaving(false)
        }
    }

    const updateSmtpSetting = (key, value) => {
        setSmtpSettings(current => ({ ...current, [key]: value }))
    }

    const saveSmtpSettings = async () => {
        setSmtpSaving(true)
        setSmtpError('')
        setSmtpMessage('')
        try {
            const settings = await SaveAdminSmtpSettings(smtpSettings)
            setSmtpSettings({ ...settings, password: '' })
            setSmtpPasswordConfigured(settings.passwordConfigured)
            setSmtpMessage('SMTP settings saved.')
        } catch (requestError) {
            setSmtpError(requestError.response?.data?.message || 'Could not save SMTP settings.')
        } finally {
            setSmtpSaving(false)
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
                    <section className="payment-settings-access">
                        <div>
                            <h2>UPI payment options</h2>
                            <p>Manage the app providers and UPI IDs shown during checkout.</p>
                        </div>
                        <div className="payment-settings-key-row">
                    <span className="text-sm font-medium text-slate-700">Admin session active</span>
                    <button type="button" onClick={loadOptions} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
                </div>
            </section>

            {error && <p className="payment-settings-alert error" role="alert">{error}</p>}
            {message && <p className="payment-settings-alert success" role="status">{message}</p>}

                    <section className="payment-settings-list-section">
                        <div className="payment-settings-list-heading">
                            <h3>Configured UPI IDs</h3>
                            <span>{upiOptions.length} options</span>
                        </div>

                        {upiOptions.length === 0 ? (
                            <p className="payment-settings-empty">No UPI options configured yet.</p>
                        ) : (
                            <div className="payment-settings-options">
                                {upiOptions.map((option, index) => (
                                    <div className="payment-settings-option" key={option.id || `upi-${index}`}>
                                        <label className="payment-settings-enabled">
                                            <input type="checkbox" checked={option.enabled !== false} onChange={event => updateOption(index, { enabled: event.target.checked })} />
                                            <span>Enabled</span>
                                        </label>
                                        <label>
                                            <span>App</span>
                                            <select value={option.provider} onChange={event => changeProvider(index, event.target.value)}>
                                                {PROVIDERS.map(provider => <option key={provider.value} value={provider.value}>{provider.label}</option>)}
                                            </select>
                                        </label>
                                        <label>
                                            <span>Display name</span>
                                            <input value={option.label} onChange={event => updateOption(index, { label: event.target.value })} maxLength={60} />
                                        </label>
                                        <label className="payment-settings-vpa-field">
                                            <span>UPI ID</span>
                                            <input value={option.upiId} onChange={event => updateOption(index, { upiId: event.target.value })} placeholder="merchant@bank" maxLength={120} />
                                        </label>
                                        <button className="payment-settings-remove" type="button" onClick={() => setUpiOptions(current => current.filter((_, optionIndex) => optionIndex !== index))}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="payment-settings-actions">
                            <button className="secondary" type="button" onClick={addOption}>Add UPI ID</button>
                            <button type="button" onClick={saveOptions} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
                        </div>
                    </section>

            <section className="payment-settings-list-section smtp-settings-section">
                <div className="payment-settings-list-heading">
                    <h3>Email SMTP settings</h3>
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
                </div>
                <div className="payment-settings-actions">
                    <span className="smtp-settings-password-status">{smtpPasswordConfigured ? 'Password saved' : 'Password not configured'}</span>
                    <button type="button" onClick={saveSmtpSettings} disabled={smtpSaving || smtpLoading}>{smtpSaving ? 'Saving…' : 'Save SMTP settings'}</button>
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

export default PaymentSettings