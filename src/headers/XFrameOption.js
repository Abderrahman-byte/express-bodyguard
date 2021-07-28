const XFrameOption = (sameSite = false, allow = []) => {
    const headerName = 'X-Frame-Option'
    const headerValues = [sameSite ? 'samesite' : 'deny']
    allow.forEach((url) => {
        try {
            headerValues.push(`allow-from ${new URL(url).origin}`)
        } catch (err) {
            return false
        }
    })

    return (request, response, next) => {
        headerValues.forEach((value) => {
            response.setHeader(headerName, value)
        })

        if (next instanceof Function) next()
    }
}

module.exports = XFrameOption
