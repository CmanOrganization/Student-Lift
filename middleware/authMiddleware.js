const jwt = require(`jsonwebtoken`);

const protect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization || '';

    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        try {
            token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || `fallback_secret_key`);
            req.user = decoded;
            return next();
        } catch (error) {
            return res.status(401).json({ error: `Not authorized, token validation failed.` });
        }
    }

    return res.status(401).json({ error: `Not authorized, no token provided.` });
};

module.exports = { protect };