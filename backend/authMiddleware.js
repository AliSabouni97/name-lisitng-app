// backend/authMiddleware.js
const jwt = require('jsonwebtoken');

const authCheck = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).send({ error: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send({ error: 'Invalid token' });
    }
};

const adminCheck = (req, res, next) => {
    authCheck(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            res.status(403).send({ error: 'Access denied' });
        }
    });
};

module.exports = { authCheck, adminCheck };