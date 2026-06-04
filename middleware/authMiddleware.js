const jwt = require(`jsonwebtoken`);

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith(`Bearer`)) {
        token = req.headers.authorization.split(` `)[1];
    }

    // Fallback: check cookie header for authToken if Authorization header missing
    if (!token && req.headers && req.headers.cookie) {
        var cookieHeader = req.headers.cookie; // e.g. "authToken=abc; other=val"
        var match = cookieHeader.match(/(?:^|;)\s*authToken=([^;]+)/);
        if (match) {
            token = match[1];
        }
    }

    if (!token) {
        return res.status(401).json({ error: `Not authorized, no token provided.` });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || `fallback_secret_key`);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: `Not authorized, token validation failed.` });
    }
};

module.exports = {protect};