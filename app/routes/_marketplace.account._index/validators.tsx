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
export function validateUserRegistrationForm(formValues: any) {
  const errors: any = {};

  // Validate name
  const [isNameValid, nameErrors] = validateName(formValues["name"]);
  if (!isNameValid) {
    errors["name"] = nameErrors;
  }

  // Validate email
  const [isEmailValid, emailErrors] = validateEmail(formValues["email"]);
  if (!isEmailValid) {
    errors["email"] = emailErrors;
  }
  if (validator.isEmpty(formValues["email-confirm"])) {
    errors["email-confirm"] = ["El campo 'confirmar email' es obligatorio."];
  }
  if (formValues["email"] !== formValues["email-confirm"]) {
    errors["email-confirm"] = ["Los emails no coinciden."];
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

  // Agreement validation
  if (!formValues["use-terms_confirmed"]) {
    errors["use-terms_confirmed"] = [
      "Debes aceptar términos y condiciones de uso.",
    ];
  }
  if (!formValues["returns-privacy_confirmed"]) {
    errors["returns-privacy_confirmed"] = [
      "Debes aceptar las políticas de envío y devoluciones.",
    ];
  }
  if (!formValues["terms_confirmed"]) {
    errors["termsConfirmed"] = [
      "Debes aceptar los términos y condiciones del marketplace.",
    ];
  }

  return errors;
}


// USER PROFILE UPDATE VALIDATOR
export function validateUserProfileForm(formValues: any) {
  const errors: any = {};

  // Validate name
  const [isNameValid, nameErrors] = validateName(formValues["name"]);
  if (!isNameValid) {
    errors["name"] = nameErrors;
  }

  // Validate lastname
  if(formValues["lastname"]){
    const [isLastNameValid, lastNameErrors] = validateLastName(formValues["lastname"]);
    if (!isLastNameValid) {
      errors["lastname"] = lastNameErrors;
    }
  }

  // Validate email
  const [isEmailValid, emailErrors] = validateEmail(formValues["email"]);
  if (!isEmailValid) {
    errors["email"] = emailErrors;
  }

  // Password validation
  if(formValues["password"]){
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
  }
  
  // Return errors
  return errors;
}
