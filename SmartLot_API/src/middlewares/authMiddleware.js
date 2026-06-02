import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: true, message: 'Falta el token de autenticacion.', statusCode: 401 });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
        return res.status(401).json({ error: true, message: 'Formato de token invalido.', statusCode: 401 });
    }

    const token = parts[1];

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ error: true, message: 'Token invalido o expirado.', statusCode: 401 });
    }
};

export default authMiddleware;
