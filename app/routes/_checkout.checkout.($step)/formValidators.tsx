import validator from "validator";


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

export function validateStreet(street: string): [boolean, Array<string>] {
  let isValid = true;
  const errors: string[] = [];

  if (validator.isEmpty(street)) {
    isValid = false;
    errors.push("El campo 'calle' es obligatorio.");
  }
  if (!validator.isLength(street, { min: 2 })) {
    isValid = false;
    errors.push("La calle debe tener al menos 2 caracteres.");
  }

  return [isValid, errors];
}

export function validateZip(zip: string): [boolean, Array<string>] {
  let isValid = true;
  const errors: string[] = [];

  if (validator.isEmpty(zip)) {
    isValid = false;
    errors.push("El campo 'código postal' es obligatorio.");
  }
  if (!validator.isPostalCode(zip, "MX")) {
    isValid = false;
    errors.push("El código postal no es válido.");
  }

  return [isValid, errors];
}

export function validateCity(city: string): [boolean, Array<string>] {
  let isValid = true;
  const errors: string[] = [];

  if (validator.isEmpty(city)) {
    isValid = false;
    errors.push("El campo 'ciudad' es obligatorio.");
  }
  if (!validator.isLength(city, { min: 2 })) {
    isValid = false;
    errors.push("La ciudad debe tener al menos 2 caracteres.");
  }

  return [isValid, errors];
}

export function validateState(state: string): [boolean, Array<string>] {
  let isValid = true;
  const errors: string[] = [];

  if (validator.isEmpty(state)) {
    isValid = false;
    errors.push("El campo 'estado' es obligatorio.");
  }
  if (!validator.isLength(state, { min: 2 })) {
    isValid = false;
    errors.push("El estado debe tener al menos 2 caracteres.");
  }

  return [isValid, errors];
}

export function validateNeighborhood(neighborhood: string): [boolean, Array<string>] {
  let isValid = true;
  const errors: string[] = [];

  if (validator.isEmpty(neighborhood)) {
    isValid = false;
    errors.push("El campo 'colonia' es obligatorio.");
  }
  if (!validator.isLength(neighborhood, { min: 2 })) {
    isValid = false;
    errors.push("La colonia debe tener al menos 2 caracteres.");
  }

  return [isValid, errors];
}

export function validateAddressNumber(addressNumber: string): [boolean, Array<string>] {
  let isValid = true;
  const errors: string[] = [];

  if (validator.isEmpty(addressNumber)) {
    isValid = false;
    errors.push("El campo 'número' es obligatorio.");
  }
  if (!validator.isLength(addressNumber, { min: 1 })) {
    isValid = false;
    errors.push("El número debe tener al menos 1 caracter.");
  }

  return [isValid, errors];
}



// Action function
export function validateShippingAddressForm(formValues: {
  [key: string]: any;
}): { [key: string]: any } {
  const errors: any = {};

  // Check if formValues is empty
  if (!formValues) {
    return { default: ["Form not present."] };
  }

  // Validate name and lastname
  const [isNameValid, nameErrors] = validateName(formValues["user[name]"]);
  if (!isNameValid) {
    errors["user[name]"] = nameErrors;
  }
  const [isLastNameValid, lastNameErrors] = validateLastName(
    formValues["user[lastname]"]
  );
  if (!isLastNameValid) {
    errors["user[lastname]"] = lastNameErrors;
  }

  // Validate email
  const [isEmailValid, emailErrors] = validateEmail(formValues["user[email]"]);
  if (!isEmailValid) {
    errors["user[email]"] = emailErrors;
  }

  // Phone validation
  const [isPhoneValid, phoneErrors] = validatePhone(formValues["user[phone]"]);
  if (!isPhoneValid) {
    errors["user[phone]"] = phoneErrors;
  }

  // Street validation
  const [isStreetValid, streetErrors] = validateStreet(formValues["user[street]"]);
  if (!isStreetValid) {
    errors["user[street]"] = streetErrors;
  }

  // Address exterior number validation
  const [isNumExtValid, numExtErrors] = validateAddressNumber(formValues["user[num_ext]"]);
  if (!isNumExtValid) {
    errors["user[num_ext]"] = numExtErrors;
  }

  // Address interior number validation
  // const [isNumIntValid, numIntErrors] = validateAddressNumber(formValues["user[num_int]"]);
  // if (!isNumIntValid) {
  //   errors["user[num_int]"] = numIntErrors;
  // }

  // Address zipcode validation
  const [isZipValid, zipErrors] = validateZip(formValues["user[zipcode]"]);
  if (!isZipValid) {
    errors["user[zipcode]"] = zipErrors;
  }

  // Address state validation
  const [isStateValid, stateErrors] = validateState(formValues["user[stateName]"]);
  if (!isStateValid) {
    errors["user[stateName]"] = stateErrors;
  }

  // Address city validation
  const [isCityValid, cityErrors] = validateCity(formValues["user[cityName]"]);
  if (!isCityValid) {
    errors["user[cityName]"] = cityErrors;
  }

  // Address neighborhood validation
  const [isNeighborhoodValid, neighborhoodErrors] = validateNeighborhood(formValues["user[neighborhood]"]);
  if (!isNeighborhoodValid) {
    errors["user[neighborhood]"] = neighborhoodErrors;
  }


  console.log('para validar', errors)

  return errors;
}
