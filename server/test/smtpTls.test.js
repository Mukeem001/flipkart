const test = require("node:test")
const assert = require("node:assert/strict")
const { getSmtpTlsConfigurationError } = require("../service/smtpTls")

test("SMTP TLS mode accepts the standard secure port and STARTTLS port configurations", () => {
    assert.equal(getSmtpTlsConfigurationError(465, true), null)
    assert.equal(getSmtpTlsConfigurationError(587, false), null)
})

test("SMTP TLS mode reports standard port and encryption mismatches", () => {
    assert.match(getSmtpTlsConfigurationError(465, false), /port 465/)
    assert.match(getSmtpTlsConfigurationError(587, true), /port 587/)
})

test("SMTP TLS mode leaves provider-specific ports configurable", () => {
    assert.equal(getSmtpTlsConfigurationError(2525, false), null)
    assert.equal(getSmtpTlsConfigurationError(8465, true), null)
})
