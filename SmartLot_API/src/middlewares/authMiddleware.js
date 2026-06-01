import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Falta el token de autenticacion.' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
        return res.status(401).json({ message: 'Formato de token invalido. Use: Bearer TOKEN.' });
    }

    const token = parts[1];

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token invalido o expirado.' });
    }
};

export default authMiddleware;
