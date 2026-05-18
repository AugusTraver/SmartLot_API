// helpers/validatorHelper.js

/**
 * Valida si un ID es estrictamente numérico y mayor a 0.
 */
export const isValidId = (id) => {
    // La expresión regular ^[1-9]\d*$ asegura que sea un número entero positivo (sin decimales ni letras)
    return /^[1-9]\d*$/.test(id);
};

/**
 * Valida el formato básico de un email.
 */
export const isValidEmail = (email) => {
    // Expresión regular básica para validar emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valida si una cadena de texto no está vacía y tiene una longitud mínima.
 */
export const isValidString = (str, minLength = 1) => {
    return typeof str === 'string' && str.trim().length >= minLength;
};

/**
 * Valida si la contraseña cumple con los requisitos mínimos (ej. al menos 6 caracteres).
 */
export const isValidPassword = (password) => {
    return typeof password === 'string' && password.length >= 6;
};

// Puedes ir agregando más validaciones aquí según las necesites (ej. para patentes)