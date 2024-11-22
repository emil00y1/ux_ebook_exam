// Constants
export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/,
  phone: /^\d{8}$/,
};

/**
 * Validates a name (first or last)
 * @param {string} name - The name to validate
 * @param {number} minLength - Minimum required length (default: 2)
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateName = (name, minLength = 2) => {
  if (name.trim().length < minLength) {
    return {
      isValid: false,
      error: `Name must be at least ${minLength} characters long`,
    };
  }
  return { isValid: true, error: null };
};

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateEmail = (email) => {
  if (!REGEX.email.test(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }
  return { isValid: true, error: null };
};

/**
 * Validates a password
 * @param {string} password - The password to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validatePassword = (password) => {
  if (!REGEX.password.test(password)) {
    return {
      isValid: false,
      error:
        "Password must be at least 8 characters, include 1 lowercase, 1 uppercase, 1 number, and 1 special character",
    };
  }
  return { isValid: true, error: null };
};

/**
 * Validates if passwords match
 * @param {string} password - The original password
 * @param {string} repeatPassword - The repeated password
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validatePasswordMatch = (password, repeatPassword) => {
  if (password !== repeatPassword) {
    return {
      isValid: false,
      error: "Passwords do not match",
    };
  }
  return { isValid: true, error: null };
};

/**
 * Validates an address
 * @param {string} address - The address to validate
 * @param {number} minLength - Minimum required length (default: 5)
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validateAddress = (address, minLength = 5) => {
  if (address.trim().length < minLength) {
    return {
      isValid: false,
      error: `Address must be at least ${minLength} characters long`,
    };
  }
  return { isValid: true, error: null };
};

/**
 * Validates a phone number
 * @param {string} phone - The phone number to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export const validatePhone = (phone) => {
  if (!REGEX.phone.test(phone)) {
    return {
      isValid: false,
      error: "Phone number must be 8 digits",
    };
  }
  return { isValid: true, error: null };
};

/**
 * Validates an entire form data object
 * @param {Object} formData - Object containing all form fields
 * @returns {object} - { isValid: boolean, errors: Object }
 */
export const validateForm = ({
  firstName,
  lastName,
  email,
  password,
  repeatPassword,
  address,
  phone,
}) => {
  const errors = {};
  let isValid = true;

  const validators = {
    firstName: () => validateName(firstName),
    lastName: () => validateName(lastName),
    email: () => validateEmail(email),
    password: () => validatePassword(password),
    repeatPassword: () => validatePasswordMatch(password, repeatPassword),
    address: () => validateAddress(address),
    phone: () => validatePhone(phone),
  };

  for (const [field, validator] of Object.entries(validators)) {
    const { isValid: fieldIsValid, error } = validator();
    if (!fieldIsValid) {
      errors[field] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
};
