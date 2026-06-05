import rateLimit from 'express-rate-limit';

const authRateLimiter = rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    handler: (req, res) => {
        res.status(429).json({
            error: true,
            message: 'Demasiadas solicitudes. Intente nuevamente en 3 minutos.',
            statusCode: 429
        });
    }
});

export default authRateLimiter;
