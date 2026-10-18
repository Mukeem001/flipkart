const nodemailer = require("nodemailer");
const { getSmtpSettings } = require("../service/smtpSettings");
const { assertRecipientAccepted } = require("../service/emailDelivery");
const { SMTP_TLS_MODE_GUIDANCE } = require("../service/smtpTls");

const sendWithSmtp = async ({ settings, to, subject, html, text }) => {
    const transporter = nodemailer.createTransport({
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        auth: { user: settings.user, pass: settings.password },
        family: 4,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
    });

    try {
        const result = await transporter.sendMail({ from: settings.senderEmail, to, subject, html, text });
        assertRecipientAccepted(result, to)
        return result;
    } catch (error) {
        if (typeof error?.message === "string" && /wrong version number|tls_validate_record_header/i.test(error.message)) {
            throw new Error(`SMTP TLS handshake failed. ${SMTP_TLS_MODE_GUIDANCE}`, { cause: error });
        }
        throw error;
    } finally {
        transporter.close();
    }
};

const sendWithResend = async ({ apiKey, from, to, subject, html, text }) => {
    let response;
    try {
        response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ from, to: [to], subject, html, text }),
            signal: AbortSignal.timeout(15000)
        });
    } catch (error) {
        if (error.name === "TimeoutError" || error.name === "AbortError") {
            throw new Error("Email provider request timed out. Please try again.");
        }
        throw new Error(`Email provider request failed: ${error.message}`);
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = typeof result.message === "string" ? result.message : "Email provider rejected the request.";
        throw new Error(`Email provider error (${response.status}): ${message}`);
    }

    return result;
};

const sendMailWithSmtpSettings = async ({ to, subject, html, text }) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
        const from = process.env.RESEND_FROM_EMAIL;
        if (!from) {
            const error = new Error("RESEND_FROM_EMAIL must be set to a verified sender address.");
            error.code = "EMAIL_SENDER_NOT_CONFIGURED";
            throw error;
        }
        return sendWithResend({ apiKey: resendApiKey, from, to, subject, html, text });
    }

    const settings = await getSmtpSettings();
    if (!settings) {
        const error = new Error("SMTP settings are not configured in Admin Settings.");
        error.code = "SMTP_NOT_CONFIGURED";
        throw error;
    }

    return sendWithSmtp({ settings, to, subject, html, text });
};

const sendEmailDeliveryTest = async ({ to }) => {
    return sendMailWithSmtpSettings({
        to,
        subject: "Email delivery test",
        text: "Hello,\n\nThis is a test email to confirm that your email delivery settings are working.\n\nYou can ignore this email.",
        html: "<p>Hello,</p><p>This is a test email to confirm that your email delivery settings are working.</p><p>You can ignore this email.</p>"
    });
};

module.exports = { sendEmailDeliveryTest, sendMailWithSmtpSettings };