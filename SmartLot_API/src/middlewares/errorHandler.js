const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Error interno del servidor' : err.message;

    if (statusCode === 500) {
        console.error('Error no manejado:', err);
        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    }

    res.status(statusCode).json({ error: true, message, statusCode });
};

export default errorHandler;
