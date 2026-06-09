// helpers/validatorHelper.js

/**
 * Valida si un ID es estrictamente numérico y mayor a 0.
 */
export const isValidId = (id) => {
    if (id === null || id === undefined) return false;
    // La expresión regular ^[1-9]\d*$ asegura que sea un número entero positivo (sin decimales ni letras)
    return /^[1-9]\d*$/.test(String(id));
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
    if (typeof password !== 'string') return false;
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};

/**
 * Valida si una fecha es parseable y válida.
 */
export const isValidDate = (date) => {
    if (!date) return false;
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
};

/**
 * Valida si un teléfono es una cadena numérica de 7 a 15 dígitos.
 */
export const isValidPhone = (phone) => {
    return /^\d{7,15}$/.test(phone);
};

/**
 * Valida si una patente tiene formato argentino válido (ABC123 o AB123CD).
 */
export const isValidPatente = (patente) => {
    if (!patente || typeof patente !== 'string') return false;
    const upper = patente.toUpperCase();
    return /^[A-Z]{3}\d{3}$/.test(upper) || /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(upper);
};

/**
 * Valida si un valor es un número positivo.
 */
export const isValidPositiveNumber = (n) => {
    return typeof n === 'number' && n > 0;
};

export const isValidTime = (time) => {
    if (!time || typeof time !== 'string') return false;
    return /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/.test(time);
};