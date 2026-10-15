const nodemailer = require("nodemailer");
const { getSmtpSettings } = require("../service/smtpSettings");

const sendWithResend = async ({ apiKey, from, to, subject, html }) => {
    let response;
    try {
        response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ from, to: [to], subject, html }),
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

const sendMailWithSmtpSettings = async ({ to, subject, html }) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
        const from = process.env.RESEND_FROM_EMAIL;
        if (!from) {
            const error = new Error("RESEND_FROM_EMAIL must be set to a verified sender address.");
            error.code = "EMAIL_SENDER_NOT_CONFIGURED";
            throw error;
        }
        return sendWithResend({ apiKey: resendApiKey, from, to, subject, html });
    }

    const settings = await getSmtpSettings();
    if (!settings) {
        const error = new Error("SMTP settings are not configured in Admin Settings.");
        error.code = "SMTP_NOT_CONFIGURED";
        throw error;
    }

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
        return await transporter.sendMail({ from: settings.senderEmail, to, subject, html });
    } finally {
        transporter.close();
    }
};

module.exports = { sendMailWithSmtpSettings };