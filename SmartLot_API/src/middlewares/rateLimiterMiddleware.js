import rateLimit from 'express-rate-limit';

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: true,
            message: 'Demasiadas solicitudes. Intente nuevamente en 15 minutos.',
            statusCode: 429
        });
    }
});

export default authRateLimiter;
