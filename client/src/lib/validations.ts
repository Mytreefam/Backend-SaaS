/**
 * Funciones de Validación para Formularios
 * 
 * Incluye validaciones comunes para:
 * - Email
 * - Teléfono español
 * - DNI/NIE español
 * - Contraseñas
 * - Datos fiscales (CIF)
 * - Tarjetas de crédito
 */

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida teléfono español (9 dígitos)
 */
export function isValidPhoneES(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Valida DNI español
 */
export function isValidDNI(dni: string): boolean {
  const dniRegex = /^[0-9]{8}[A-Z]$/;
  if (!dniRegex.test(dni)) return false;

  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const number = parseInt(dni.substring(0, 8), 10);
  const letter = dni.charAt(8);
  
  return letters.charAt(number % 23) === letter;
}

/**
 * Valida NIE español
 */
export function isValidNIE(nie: string): boolean {
  const nieRegex = /^[XYZ]\d{7}[A-Z]$/;
  if (!nieRegex.test(nie)) return false;

  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  let number = nie.substring(1, 8);
  
  // Reemplazar X, Y, Z por 0, 1, 2
  const prefix = nie.charAt(0);
  if (prefix === 'X') number = '0' + number;
  else if (prefix === 'Y') number = '1' + number;
  else if (prefix === 'Z') number = '2' + number;

  const letter = nie.charAt(8);
  return letters.charAt(parseInt(number, 10) % 23) === letter;
}

/**
 * Valida DNI o NIE
 */
export function isValidDNIorNIE(value: string): boolean {
  return isValidDNI(value) || isValidNIE(value);
}

/**
 * Valida CIF español (empresas)
 */
export function isValidCIF(cif: string): boolean {
  const cifRegex = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/;
  return cifRegex.test(cif);
}

/**
 * Valida contraseña (mínimo 8 caracteres, mayúscula, minúscula, número)
 */
export function isValidPassword(password: string): { 
  valid: boolean; 
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida código postal español
 */
export function isValidPostalCodeES(postalCode: string): boolean {
  const postalRegex = /^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/;
  return postalRegex.test(postalCode);
}

/**
 * Valida número de tarjeta de crédito (algoritmo de Luhn)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(sanitized)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Valida IBAN español
 */
export function isValidIBAN(iban: string): boolean {
  const ibanRegex = /^ES\d{22}$/;
  const sanitized = iban.replace(/\s/g, '');
  return ibanRegex.test(sanitized);
}

/**
 * Valida que un string no esté vacío (después de trim)
 */
export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Valida longitud mínima
 */
export function minLength(value: string, min: number): boolean {
  return value.length >= min;
}

/**
 * Valida longitud máxima
 */
export function maxLength(value: string, max: number): boolean {
  return value.length <= max;
}

/**
 * Valida que un número esté en un rango
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Valida que un número sea positivo
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * Valida URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitiza input para prevenir XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valida formato de fecha (YYYY-MM-DD)
 */
export function isValidDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Valida que una fecha sea mayor que otra
 */
export function isDateAfter(date: string, afterDate: string): boolean {
  return new Date(date) > new Date(afterDate);
}

/**
 * Mensajes de error en español
 */
export const validationMessages = {
  required: 'Este campo es obligatorio',
  email: 'Email inválido',
  phone: 'Teléfono inválido (9 dígitos)',
  dni: 'DNI inválido',
  nie: 'NIE inválido',
  cif: 'CIF inválido',
  password: 'Contraseña no cumple los requisitos',
  postalCode: 'Código postal inválido',
  creditCard: 'Número de tarjeta inválido',
  iban: 'IBAN inválido',
  url: 'URL inválida',
  minLength: (min: number) => `Mínimo ${min} caracteres`,
  maxLength: (max: number) => `Máximo ${max} caracteres`,
  positive: 'Debe ser un número positivo',
  inRange: (min: number, max: number) => `Debe estar entre ${min} y ${max}`,
};
