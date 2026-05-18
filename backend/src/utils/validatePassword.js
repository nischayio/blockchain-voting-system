// password strength validation
export const validatePassword = (
  password
) => {

  const minLength = 8;

  const hasUppercase =
    /[A-Z]/.test(password);

  const hasLowercase =
    /[a-z]/.test(password);

  const hasNumber =
    /\d/.test(password);

  const hasSpecialCharacter =
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return "Password must be at least 8 characters long";
  }

  if (!hasUppercase) {
    return "Password must contain at least one uppercase letter";
  }

  if (!hasLowercase) {
    return "Password must contain at least one lowercase letter";
  }

  if (!hasNumber) {
    return "Password must contain at least one number";
  }

  if (!hasSpecialCharacter) {
    return "Password must contain at least one special character";
  }

  return null;
};