const SMTP_TLS_MODE_GUIDANCE =
    "Use port 465 with Secure connection enabled, or port 587 with Secure connection disabled (STARTTLS)."

const getSmtpTlsConfigurationError = (port, secure) => {
    if ((port === 465 && !secure) || (port === 587 && secure)) {
        return SMTP_TLS_MODE_GUIDANCE
    }
    return null
}

module.exports = { getSmtpTlsConfigurationError, SMTP_TLS_MODE_GUIDANCE }
