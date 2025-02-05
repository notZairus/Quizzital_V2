



export class Validator {

  static isEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static isNumber(value) {
    return !isNaN(value);
  }

  static isStrongPassword(password) {
    return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
  }

  static isNotEmpty(value) {
    return value.trim().length > 0;
  }

  static lengthValidate(value, min, max=1000) {
    if (min > max || min == max) {
      console.log('input a proper min max value.')
      return new Error('invalid parameter');
    }

    return value.length >= min && value.length <= max
  }
}