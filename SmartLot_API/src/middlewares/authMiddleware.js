import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
            return res.status(401).json({ error: true, message: 'Formato de token invalido.', statusCode: 401 });
        }
        token = parts[1];
    }

    if (!token && req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ error: true, message: 'Falta el token de autenticacion.', statusCode: 401 });
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        return res.status(401).json({ error: true, message: 'Token invalido o expirado.', statusCode: 401 });
    }
};

export default authMiddleware;
