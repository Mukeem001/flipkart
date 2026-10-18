const assertRecipientAccepted = (result, recipient, provider = "SMTP server") => {
    const accepted = result.accepted || []
    const rejected = result.rejected || []
    const recipientAccepted = accepted.some(address => String(address).toLowerCase() === recipient.toLowerCase())

    if (rejected.length || !recipientAccepted) {
        throw new Error(`${provider} did not accept the test recipient${result.response ? `: ${result.response}` : "."}`)
    }
}

module.exports = { assertRecipientAccepted }
