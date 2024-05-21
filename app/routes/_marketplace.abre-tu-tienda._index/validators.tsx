import validator from "validator";

export function validateBrandName(brand: string): [boolean, Array<string>] {
  let isValid = true;
  const errors: string[] = [];

  if (validator.isEmpty(brand)) {
    isValid = false;
    errors.push("El campo 'marca' es obligatorio.");
  }
  return [isValid, errors];
}
export function validateName(name: string): [boolean, Array<any>] {
  let isValid = true;
  const errors: string[] = [];

  if (validator.isEmpty(name)) {
    isValid = false;
    errors.push("El campo 'nombre' es obligatorio.");
  }
  if (!validator.isLength(name, { min: 2 })) {
    isValid = false;
    errors.push("El nombre debe tener al menos 2 caracteres.");
  }
  return [isValid, errors];
}

export function validateLastName(lastname: string): [boolean, Array<any>] {
  let isValid = true;
  const errors: string[] = [];

  if (validator.isEmpty(lastname)) {
    isValid = false;
    errors.push("El campo 'apellidos' es obligatorio.");
  }
  if (!validator.isLength(lastname, { min: 2 })) {
    isValid = false;
    errors.push("Los apellidos deben tener al menos 2 caracteres.");
  }

  console.log("isValid lastname ", isValid, "errors", errors);
  return [isValid, errors];
}

//
export function validateEmail(email: string): [boolean, Array<string>] {
  let isValid = true;
  const errors: string[] = [];

  if (validator.isEmpty(email)) {
    isValid = false;
    errors.push("El campo 'email' es obligatorio.");
  }
  if (!validator.isEmail(email)) {
    isValid = false;
    errors.push("El email no es válido.");
  }

  return [isValid, errors];
}

export function comparePasswords(
  password: string,
  passwordConfirm: string
): [boolean, Array<string>] {
  let isValid = true;
  const errors: string[] = [];

  if (validator.isEmpty(passwordConfirm)) {
    isValid = false;
    errors.push("El campo 'confirmar contraseña' es obligatorio.");
  }
  if (password !== passwordConfirm) {
    isValid = false;
    errors.push("Las contraseñas no coinciden.");
  }

  return [isValid, errors];
}

export function validatePassword(password: string): [boolean, Array<string>] {
  let isValid = true;
  const errors: string[] = [];

  if (validator.isEmpty(password)) {
    isValid = false;
    errors.push("El campo 'contraseña' es obligatorio.");
  }
  if (!validator.isLength(password, { min: 8 })) {
    isValid = false;
    errors.push("La contraseña debe tener al menos 8 caracteres.");
  }
  return [isValid, errors];
}

export function validatePhone(phone: string): [boolean, Array<string>] {
  let isValid = true;
  const errors: string[] = [];

  if (validator.isEmpty(phone)) {
    isValid = false;
    errors.push("El campo 'teléfono' es obligatorio.");
  }
  if (!validator.isMobilePhone(phone, "es-MX")) {
    isValid = false;
    errors.push("El teléfono no es válido.");
  }

  return [isValid, errors];
}

// Action function
export function validateSellerRegistrationForm(formValues: any) {
  const errors: any = {};

  // Validate brand name
  const [isBrandNameValid, brandNameErrors] = validateBrandName(
    formValues["brand"]
  );
  if (!isBrandNameValid) {
    errors["brand"] = brandNameErrors;
  }

  // Validate name and lastname
  const [isNameValid, nameErrors] = validateName(formValues["name"]);
  if (!isNameValid) {
    errors["name"] = nameErrors;
  }
  const [isLastNameValid, lastNameErrors] = validateLastName(
    formValues["lastname"]
  );
  if (!isLastNameValid) {
    errors["lastname"] = lastNameErrors;
  }

  // Validate email
  const [isEmailValid, emailErrors] = validateEmail(formValues["email"]);
  if (!isEmailValid) {
    errors["email"] = emailErrors;
  }

  // Password validation
  const [isPasswordValid, passwordErrors] = validatePassword(
    formValues["password"]
  );
  if (!isPasswordValid) {
    errors["password"] = passwordErrors;
  }
  const [isPasswordConfirmValid, passwordConfirmErrors] = comparePasswords(
    formValues["password"],
    formValues["password-confirm"]
  );
  if (!isPasswordConfirmValid) {
    errors["password-confirm"] = passwordConfirmErrors;
  }

  // Phone validation
  const [isPhoneValid, phoneErrors] = validatePhone(formValues["phone"]);
  if (!isPhoneValid) {
    errors["phone"] = phoneErrors;
  }

  // Look for stripe payment intent
  if (!formValues["payment_intent"] || validator.isEmpty(formValues["payment_intent"])) {
    errors["payment_intent"] = [
      "Se produjo un error al procesar el pago.",
    ];
  }

  // Agreement validation
  if (!formValues["agreement_confirmed"]) {
    errors["agreementConfirmed"] = [
      "Debes aceptar el convenio con México Limited.",
    ];
  }
  if (!formValues["privacy_confirmed"]) {
    errors["privacyPolyConfirmed"] = [
      "Debes aceptar la política de privacidad.",
    ];
  }
  if (!formValues["terms_confirmed"]) {
    errors["termsConfirmed"] = [
      "Debes aceptar los términos y condiciones del marketplace.",
    ];
  }

  return errors;
}
