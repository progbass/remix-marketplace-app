
//
export type ShippingInformation = {
  phone: string;
  email: string;
  name: string;
  lastname: string;
  street: string;
  num_ext: string;
  num_int?: string;
  town_id: number;
  cityName: string;
  state_id: string | number;
  stateName: string;
  zipcode: string | null;
  neighborhood: string;
  address_references?: string | null;
};

export type ShoppingCartProduct = {
  id: number | string;
  type: "productunique" | "sizesmodels" | "models" | "sizes";
  name: string;
  image: string;
  users_id: number;
  price: number;
  activate_discount: boolean | number;
  discount: number;
  free_shipping: boolean | number;
  brand: string;
  quantity: number;
  modelo: number | null;
  delivery_time: number;
  sku: string | null;
  stock: number | null;
  pre_price: number;
  ships_from: string | null;
  namemodel: string | null;
  namemodel_model: string | null;
  namemodel_size: string | nul;
};

export type ShoppingCartShop = {
  id: number | string;
  name: string;
  image: string;
  users_id: number;
  products: ShoppingCartProduct[];
  unavailableProducts: ShoppingCartProduct[];
  location: string;
  shippingQuote: ShippingQuote | null | undefined;
  selectedShippingMethod: ShippingMethod | null;
  timestamp: string | null;
};
export type ShoppingCartType = {
  cart: ShoppingCartShop[];
  shipping: ShippingInformation;
};
export type ShippingMethod = {
  image: string | boolean;
  courier: string;
  alias: string;
  courierId: string;
  serviceType: number | string;
  serviceName: string;
  deliveryTimestamp: string;
  amount: number;
  currency: string;
  packageSize: string;
  insurance_availability: boolean;
  amount_insurance_courier: number;
  minInsurance: number;
  maxInsurance: number;
};
export type ShippingQuote = {
  to_users_id: number | string;
  afiliate: string;
  packages: Array<{
    h: number;
    w: number;
    hh: number;
    weight: number;
    sizeUnit: string;
    weightUnit: string;
    declaredValue: number;
  }>;
  product: Array<{
    sku: string;
    name: string;
    imageUrl: string | null;
    free_shipping: string;
    namemodel_size: number | string | null;
    namemodel_model: number | string | null;
  }>;
  deliveries: Array<ShippingMethod>;
};

//
const defaultShipping: ShippingInformation = {
  street: "",
  num_ext: "",
  num_int: "",
  town_id: 0,
  cityName: "",
  state_id: 0,
  stateName: "",
  neighborhood: "",
  zipcode: "",
  phone: "",
  email: "",
  name: "",
  lastname: "",
  address_references: null,
};

//
class ShoppingCart {
  private subscribers: Function[] = [];
  private cart: ShoppingCartShop[] = [];
  private shipping: ShippingInformation = defaultShipping;
  public timestamp: Date = new Date();

  /**
   * Constructs a new instance of the ShoppingCart class.
   * @param products The initial array of products in the shopping cart.
   */
  constructor(
    cart: ShoppingCartType = {
      cart: [],
      shipping: defaultShipping,
    }
  ) {
    this.initCart(cart, false);
  }

  public setCart(cart: ShoppingCartType, notifySubscribers = true): void {
    this.initCart(cart, notifySubscribers);
  }

  protected initCart(cart: ShoppingCartType, notifySubscribers = true): void {
    this.shipping = cart?.shipping
      ? this.formatShippingAddress(cart?.shipping)
      : this.formatShippingAddress(defaultShipping);

    this.cart = this.reduceShops(cart?.cart || []);

    if (notifySubscribers) {
      this.notifySubscribers();
    }
  }

  public subscribe(callback: Function): Function {
    this.subscribers = [...this.subscribers, callback];

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(
        (subscriber) => subscriber !== callback
      );
    };
  }

  private async notifySubscribers(): Promise<void> {
    const reference = this.buildShoppingCartObject();
    this.subscribers.forEach((subscriber) => subscriber(reference));
  }

  private reduceProducts(
    products: ShoppingCartProduct[]
  ): ShoppingCartProduct[] {
    // Reduce all products with the same id into a single product
    const reducedCart = products.reduce((acc, product) => {
      const existingProduct = acc.find((p) => p.id === product.id);
      if (existingProduct) {
        return [
          ...acc.filter((p) => p.id !== existingProduct.id),
          {
            ...existingProduct,
            quantity: existingProduct.quantity + product.quantity,
          },
        ];
      }

      //
      return [...acc, this.getFormattedProduct(product)];
    }, [] as ShoppingCartProduct[]);

    return reducedCart;
  }

  private reduceShops(shops: ShoppingCartShop[]): ShoppingCartShop[] {
    // Create a deep copy of the shops array
    const copiedShops = JSON.parse(JSON.stringify(shops));

    // Reduce all shops with the same id into a single object
    const reducedShops = copiedShops.reduce(
      (acc: Array<ShoppingCartShop>, shop: ShoppingCartShop) => {
        const existingShop = acc.find(
          (s: ShoppingCartShop) => s.id === shop.id
        );

        // Add the products to the existing shop
        if (existingShop) {
          return [
            ...acc.filter((s: ShoppingCartShop) => s.id !== existingShop.id),
            {
              ...existingShop,
              products: this.reduceProducts([
                ...existingShop.products,
                ...shop.products,
              ]),
            },
          ];
        }

        // Return fresh new shop
        return [
          ...acc,
          {
            ...shop,
            products: this.reduceProducts(shop.products),
            selectedShippingMethod: shop.selectedShippingMethod || null,
          },
        ];
      },
      [] as ShoppingCartShop[]
    );
    return reducedShops;
  }

  private getFormattedProduct(product: any): ShoppingCartProduct {
    return {
      id: product.id,
      name: product.name,
      image: product.image,
      users_id: product.users_id,
      price: product.price,
      activate_discount: product.activate_discount,
      discount: product.discount,
      free_shipping: product.free_shipping,
      brand: product.brand,
      modelo: product.modelo,
      delivery_time: product.delivery_time,
      quantity: parseInt(product.quantity.toString(), 10),
      type: product?.type,
      sku: product?.sku,
      stock: product?.stock,
      pre_price: product?.pre_price,
      ships_from: product?.ships_from,
      namemodel: product?.namemodel,
      namemodel_model: product?.namemodel_model,
      namemodel_size: product?.namemodel_size,
    };
  }

  private addProductToShop(product: ShoppingCartProduct): void {
    // Empty product template
    const emptyProduct: ShoppingCartProduct = {
      id: 0,
      name: "",
      image: "",
      users_id: 0,
      price: 0,
      activate_discount: false,
      discount: 0,
      free_shipping: false,
      brand: "",
      quantity: 0,
      modelo: null,
      delivery_time: 0,
    };
    const formattedProduct = {
      ...emptyProduct,
      ...this.getFormattedProduct(product),
    };

    // Search for the product's shop
    const shop = this.cart.find((s) => s.id === formattedProduct.users_id);

    // If the show is not in the cart, add it and include the product
    if (!shop) {
      this.cart = [
        ...this.cart,
        {
          id: formattedProduct.users_id,
          name: formattedProduct.brand,
          users_id: formattedProduct.users_id,
          image: "",
          location: "",
          products: [formattedProduct],
          unavailableProducts: [],
          shippingQuote: null,
          selectedShippingMethod: null,
          timestamp: new Date().toISOString(),
        },
      ];
    } else {
      // If the shop is in the cart, try to find the product
      const existingProduct =
        shop.products.find((p) => p.id === formattedProduct.id) ||
        formattedProduct;
      existingProduct.quantity = this.calculateProductMaxQuantity(
        formattedProduct.quantity
      );
      shop.products = [
        ...shop.products.filter((p) => p.id !== existingProduct.id),
        existingProduct,
      ];

      // Update the shop in the cart
      this.cart = [...this.cart.filter((s) => s.id !== shop.id), shop];
    }
  }

  async addToCart(product: ShoppingCartProduct): Promise<ShoppingCartShop[]> {
    // Add the product to the cart
    this.addProductToShop(product);

    // Update state callback
    this.notifySubscribers();

    // Return the list of products
    return this.getCart().cart;
  }

  private calculateProductMaxQuantity(nextQuantity: number): number {
    // Calculate the maximum quantity of the product
    const MAX_ITEMS = 10;
    const quantity = nextQuantity > MAX_ITEMS ? MAX_ITEMS : nextQuantity;

    // TODO::
    // Notify the user if the quantity is greater than the available stock
    if (nextQuantity > MAX_ITEMS) {
      console.log("No hay suficiente stock");
    }

    return quantity;
  }

  async updateProductQuantity(
    product: ShoppingCartProduct,
    quantity: number
  ): Promise<ShoppingCartShop[]> {
    // Look for the  product in within the shops
    const shop = this.cart.find((s) => s.id === product.users_id);

    // If the shop was not found, return the current items list
    if (!shop) {
      return this.getCart().cart;
    }

    // Update product quantity
    const reducedProduct = this.reduceProducts(shop.products)[0] || null;

    // Check for available stock and update the quantity if possible
    if (reducedProduct) {
      reducedProduct.quantity = this.calculateProductMaxQuantity(quantity);
    }

    // Update local state
    shop.products = shop.products.filter((p) => p.id !== reducedProduct.id);
    if (reducedProduct.quantity > 0) {
      shop.products = [...shop.products, reducedProduct];
    }
    this.cart = this.cart.filter((s) => s.id !== shop.id);
    if (shop.products.length) {
      this.cart = [...this.cart, shop];
    }

    // Update state callback
    this.notifySubscribers();

    // Return the list of products
    return this.getCart().cart;
  }

  async removeProductFromCart(
    product: ShoppingCartProduct
  ): Promise<ShoppingCartShop[]> {
    // Look for the  product in within the shops
    const shop = this.cart.find((s) => s.id === product.users_id);

    // If the shop was not found, return the current items list
    if (!shop) {
      return this.getCart().cart;
    }

    // Remove product from cart
    shop.products = shop.products.filter((p) => p.id !== product.id);
    this.cart = [...this.cart.filter((s) => s.id !== shop.id)];
    if (shop.products) {
      this.cart = [...this.cart, shop];
    }

    // Update state callback
    this.notifySubscribers();

    // Return the list of products
    return this.getCart().cart;
  }

  private buildShoppingCartObject = (): ShoppingCartType => {
    // Sort stores by shop name
    const sortedShops = this.cart.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      return nameA.localeCompare(nameB);
    });
    return {
      cart: sortedShops,
      shipping: this.shipping,
    };
  };

  /**
   * Get the shopping cart subtotal.
   * @returns The subtotal of the shopping cart.
   */
  public getSubtotal(): number {
    let calculatedAmount: number = this.cart.reduce(
      (shopTotal, shop) =>
        shopTotal +
        shop.products.reduce(
          (productsPrice, product) =>
            productsPrice + product.price * product.quantity,
          0
        ),
      0
    );
    return parseFloat(calculatedAmount.toFixed(2));
  }

  /**
   * Get shipping cost.
   * @returns The shipping cost.
   */
  public getShippingCost(): number {
    // Calculate shipping cost by checking eacho shop
    const calculatedAmount: number = this.cart.reduce((shopTotal, shop) => {
      return (
        shopTotal +
        (shop.selectedShippingMethod && !isNaN(shop.selectedShippingMethod?.amount)
          ? shop.selectedShippingMethod.amount
          : 0)
      );
    }, 0);

    // return 
    return parseFloat(Number(calculatedAmount).toFixed(2));
  }

  /**
   * Get the shopping cart total.
   * @returns The total of the shopping cart.
   */
  public getTotal(): number {
    return this.getSubtotal() + this.getShippingCost();
  }

  /**
   * Get the products in the shopping cart.
   * @returns The products in the shopping cart.
   */
  public getProducts(): ShoppingCartProduct[] {
    // Reduce all products with the same id into a single object
    return this.cart.reduce(
      (acc: Array<ShoppingCartProduct>, shop: ShoppingCartShop) => {
        const shopProducts = shop.products;
        return [...acc, ...shopProducts];
      },
      [] as ShoppingCartProduct[]
    );
  }

  /**
   * Get the list of items in the shopping cart.
   * @returns The items in the shopping cart.
   */
  public getCart(): ShoppingCartType {
    return this.buildShoppingCartObject(); //sortedShops;
  }

  /**
   * Get products count.
   * @returns The number of products in the shopping cart.
   */
  public getProductsCount(): number {
    const cart = this.getCart().cart;
    return cart.reduce(
      (shopTotal, shop) =>
        shopTotal +
        shop.products.reduce(
          (productCount, product) => productCount + product.quantity,
          0
        ),
      0
    );
  }

  /**
   * Set shipping information to the shopping cart.
   * @param shipping The shipping information to add to the shopping cart.
   * @returns The updated shipping information.
   * @throws {Error} If the shipping information is invalid.
   */
  public setShipping(shipping: ShippingInformation): ShippingInformation {
    // Validate the shipping information
    // if (
    //   !shipping ||
    //   !shipping.street ||
    //   !shipping.town_id ||
    //   !shipping.cityName ||
    //   !shipping.state_id ||
    //   !shipping.stateName ||
    //   !shipping.zipcode ||
    //   !shipping.neighborhood ||
    //   !shipping.num_ext ||
    //   !shipping.phone ||
    //   !shipping.email ||
    //   !shipping.name ||
    //   !shipping.lastname ||
    //   !shipping.address_references
    // ) {
    //   throw new Error("Invalid shipping information")
    // }

    // Update the shopping cart with the shipping information
    this.shipping = this.formatShippingAddress(shipping);

    // Update state callback
    this.notifySubscribers();

    // Add the shipping information to the shopping cart
    return this.shipping;
  }

  private formatShippingAddress(
    shipping: ShippingInformation
  ): ShippingInformation {
    return {
      name: shipping.name,
      lastname: shipping.lastname,
      email: shipping.email,
      phone: shipping.phone,
      street: shipping.street,
      num_ext: shipping.num_ext,
      num_int: shipping.num_int,
      neighborhood: shipping.neighborhood,
      zipcode: shipping.zipcode,
      state_id: Number(shipping.state_id),
      town_id: Number(shipping.town_id),
      cityName: shipping?.cityName,
      stateName: shipping?.stateName,
      address_references: shipping?.address_references,
    };
  }

  public validateShipping(): [boolean, { [key: string]: string }] {
    const shipping = this.getShipping();

    const errors = {
      ...validateStreet("street", shipping.street),
      ...validateNumExt("num_ext", shipping.num_ext),
      ...validateTownId("town_id", shipping.town_id),
      ...validateCityName("cityName", shipping.cityName),
      ...validateStateId("state_id", shipping.state_id),
      ...validateStateName("stateName", shipping.stateName),
      ...validateZipcode("zipcode", shipping.zipcode),
      ...validatePhone("phone", shipping.phone),
      ...validateEmail("email", shipping.email),
      ...validateName("name", shipping.name),
      ...validateLastname("lastname", shipping.lastname),
      ...validateNeighborhood("neighborhood", shipping.neighborhood),
      ...validateExtraReferences(
        "address_references",
        shipping.address_references
      ),
    };

    // Return boolean if no errors present, and include the errors object
    return [Object.keys(errors).length === 0, errors];
  }

  /**
   * Get the shipping information.
   * @returns The shipping information.
   * @throws {Error} If the shipping information is not available.
   */
  public getShipping(): ShippingInformation {
    // if (!this.shipping) {
    //   throw new Error("Shipping information not available");
    // }
    return this.formatShippingAddress(this.shipping);
  }

  /**
   * Set the shipping quotes for each shop in the shopping cart.
   * @param quotes The shipping quotes to add to the shopping cart.
   * @returns The updated shipping quotes.
   * @throws {Error} If the shipping quotes are invalid.
   */
  public setShippingQuotes(quotes: ShippingQuote[]): ShoppingCartShop[] {
    // Validate the shipping quotes
    if (!quotes) {
      throw new Error("Invalid shipping quotes");
    }

    // Sort the shipping quotes by price amount
    const sortedQuotes = quotes.map((quote: ShippingQuote) => {
      quote.deliveries = quote.deliveries.sort((a, b) => a.amount - b.amount);
      return quote;
    });

    // Find the matching shop and add the shipping quotes
    this.cart = this.cart.map((shop) => {
      const matchingQuotes: ShippingQuote | undefined = sortedQuotes.find(
        (quote: any) => quote.to_users_id === shop.id
      );
      if (matchingQuotes) {
        shop.shippingQuote = matchingQuotes || null;
        shop.selectedShippingMethod = shop.selectedShippingMethod
          ? shop.selectedShippingMethod
          : matchingQuotes.deliveries[0];
      }
      return shop;
    });

    // Update state callback
    this.notifySubscribers();

    // Add the shipping quotes to the shopping cart
    return this.getCart().cart;
  }

  /**
   * Set the selected shipping method for a shop in the shopping cart.
   * @param shopId The shop ID to update the selected shipping method.
   * @param shippingMethod The selected shipping method to add to the shopping cart.
   * @returns The updated selected shipping method.
   * @throws {Error} If the shop ID or shipping method are invalid.
   * @throws {Error} If the shop ID is not found in the shopping cart.
   */
  public setShippingMethod(
    shopId: number | string,
    shippingMethod: ShippingMethod
  ): ShippingMethod {
    // Validate the shop ID and shipping method
    if (!shopId || !shippingMethod) {
      throw new Error("Invalid shop ID or shipping method");
    }

    // Find the matching shop and add the selected shipping method
    const shop = this.cart.find((s: ShoppingCartShop) => s.id === shopId);
    if (!shop) {
      throw new Error("Shop ID not found in the shopping cart");
    }
    shop.selectedShippingMethod = shippingMethod;

    // Update the shop in the cart
    this.cart = this.cart.filter((s) => s.id !== shop.id);
    this.cart = [...this.cart, shop];

    // Update state callback
    this.notifySubscribers();

    // Add the selected shipping method to the shopping cart
    return shippingMethod;
  }

  /**
   * Get the cart details in order-purchase format.
   * @returns The order to be sent to the backend.
   * @throws {Error}
   */
  public getOrder(): object {
    const shippingInformation = this.getShipping();
    //
    const order = {
      user: {
        name: shippingInformation.name,
        lastname: shippingInformation.lastname,
        email: shippingInformation.email,
        phone: shippingInformation.phone,
        street: shippingInformation.street,
        num_ext: shippingInformation.num_ext,
        num_int: shippingInformation.num_int,
        neighborhood: shippingInformation.neighborhood,
        town_id: shippingInformation.town_id,
        state_id: shippingInformation.state_id,
        zipcode: shippingInformation.zipcode,
        country: "MX",
        address_references: shippingInformation.address_references,
      },
      order: {
        subtotal: this.getSubtotal(),
        total: this.getTotal(),
        envio: this.getShippingCost(),
        payment_intent_id: null,
      },
      stores: this.getCart().cart,
    };

    return order;
  }

  /**
   * Clear the shopping cart.
   * @returns The empty shopping cart.
   * @throws {Error} If the shopping cart is not available.
   */
  public clear(notifySubscribers = true): ShoppingCartType {
    // Clear the shopping cart
    this.cart = [];
    this.shipping = defaultShipping;

    // Update state callback
    if (notifySubscribers) {
      this.notifySubscribers();
    }

    // Remove all sobscribers
    this.subscribers = [];

    // Return the empty shopping cart
    return this.getCart();
  }
}

export default ShoppingCart;

/**
 * Individual validation function for the shipping information.
 */

function validatePhone(name: string, value: any): { [key: string]: string } {
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(value)) {
    return {
      [name]: "El número de teléfono debe tener 10 dígitos",
    };
  }
  return {};
}

function validateEmail(name: string, value: any): { [key: string]: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value || !emailRegex.test(value)) {
    return {
      [name]: "El correo electrónico no es válido",
    };
  }
  return {};
}

function validateName(name: string, value: any): { [key: string]: string } {
  if (!value || value.trim() === "") {
    return {
      [name]: "El nombre es requerido",
    };
  }
  return {};
}

function validateLastname(name: string, value: any): { [key: string]: string } {
  if (!value || value.trim() === "") {
    return {
      [name]: "El apellido es requerido",
    };
  }
  return {};
}

function validateStreet(name: string, value: any): { [key: string]: string } {
  if (!value || value.trim() === "") {
    return {
      [name]: "La calle es requerida",
    };
  }
  return {};
}

function validateNumExt(name: string, value: any): { [key: string]: string } {
  if (!value || value.trim() === "") {
    return {
      [name]: "El número exterior es requerido",
    };
  }
  return {};
}

function validateTownId(name: string, value: any): { [key: string]: string } {
  if (value === undefined || value === null) {
    return {
      [name]: "La ciudad es requerida",
    };
  }
  return {};
}

function validateCityName(name: string, value: any): { [key: string]: string } {
  if (!value || value.trim() === "") {
    return {
      [name]: "El nombre de la ciudad es requerido",
    };
  }
  return {};
}

function validateStateId(name: string, value: any): { [key: string]: string } {
  if (value === undefined || value === null) {
    return {
      [name]: "El estado es requerido",
    };
  }
  return {};
}

function validateStateName(
  name: string,
  value: any
): { [key: string]: string } {
  if (!value || value.trim() === "") {
    return {
      [name]: "El nombre del estado es requerido",
    };
  }
  return {};
}

function validateZipcode(name: string, value: any): { [key: string]: string } {
  const zipcodeRegex = /^\d{5}$/;
  if (!value || !zipcodeRegex.test(value)) {
    return {
      [name]: "El código postal debe tener 5 dígitos",
    };
  }
  return {};
}

function validateNeighborhood(
  name: string,
  value: any
): { [key: string]: string } {
  if (!value || value.trim() === "") {
    return {
      [name]: "La colonia es requerida",
    };
  }
  return {};
}

function validateExtraReferences(
  name: string,
  value: any
): { [key: string]: string } {
  if (value && value.trim().length > 100) {
    return {
      [name]: "Las referencias extra no deben exceder los 100 caracteres",
    };
  }
  return {};
}
