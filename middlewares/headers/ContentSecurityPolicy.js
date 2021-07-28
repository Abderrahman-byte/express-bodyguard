const DEFAULT_POLICIES = {
    'default-src': ['\'self\''],
    'base-uri': ['\'self\''],
    'block-all-mixed-content': [],
    'font-src': ['\'self\'', 'https:', 'data:'],
    'frame-ancestors': ['\'self\''],
    'img-src': ['\'self\'', 'data:'],
    'object-src': ['\'none\''],
    'script-src': ['\'self\''],
    'script-src-attr': ['\'none\''],
    'style-src': ['\'self\'', 'https:'],
    'upgrade-insecure-requests': [],
}

const ContentSecurityPolicy = (policies = {}) => {
    const usedPolicies = { ...DEFAULT_POLICIES, ...policies }
    const normalizedDirectives = Object.entries(usedPolicies)
        .filter(policy => Boolean(policy[1]))
        .map((policy) => `${policy[0]} ${policy[1].join(' ')}`)
    const headerValue = normalizedDirectives.join('; ')
    const headerName = 'Content-Security-Policy'

    return (request, response, next) => {
        if (headerValue.trim().length > 0) response.setHeader(headerName, headerValue)
        if (next instanceof Function) next()
    }
}

module.exports = ContentSecurityPolicy
