const nodemailer = require("nodemailer");
const { getSmtpSettings } = require("../service/smtpSettings");

const sendMailWithSmtpSettings = async ({ to, subject, html }) => {
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
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000
    });

    try {
        return await transporter.sendMail({ from: settings.senderEmail, to, subject, html });
    } finally {
        transporter.close();
    }
};

module.exports = { sendMailWithSmtpSettings };