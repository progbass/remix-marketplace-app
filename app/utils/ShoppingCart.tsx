import type { Product } from "~/types/Product";

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
  zipcode: number;
  neighborhood: string;
};

export type ShoppingCartProduct = {
  id: number | string;
  name: string;
  image: string;
  users_id: number;
  price: number;
  activateDiscount: boolean | number;
  discount: number;
  hasFreeShipping: boolean | number;
  brand: string;
  quantity: number;
  modelo: number | null;
  delivery_time: number;
};

export type ShoppingCartShop = {
  id: number | string;
  name: string;
  image: string;
  users_id: number;
  products: ShoppingCartProduct[];
  unavailableProducts: ShoppingCartProduct[];
  location: string;
  shippingQuotes: ShippingQuote[];
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
  serviceType: number|string;
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
  zipcode: 0,
  phone: "",
  email: "",
  name: "",
  lastname: ""
};

//
class ShoppingCart {
  private setState: Function = () => {};
  private subscribers: Function[] = [];
  private products: ShoppingCartProduct[] = [];
  private cart: ShoppingCartShop[] = [];
  private shipping: ShippingInformation = defaultShipping;

  /**
   * Constructs a new instance of the ShoppingCart class.
   * @param products The initial array of products in the shopping cart.
   */
  constructor(cart:ShoppingCartType = {
    cart: [],
    shipping: defaultShipping,
  }) {
    this.shipping = cart?.shipping
      ? this.formatShippingAddress(cart?.shipping)
      : this.formatShippingAddress(defaultShipping);
    this.cart = this.reduceShops(cart?.cart || []);
  }

  public setCart(cart: ShoppingCartType): void {
    this.initCart(cart);
  }

  protected initCart(cart: ShoppingCartType): void {
    this.shipping = cart?.shipping
      ? this.formatShippingAddress(cart?.shipping)
      : this.formatShippingAddress(defaultShipping);
    this.cart = this.reduceShops(cart?.cart || []);
    this.notifySubscribers();
  }

  public subscribe(
    callback: Function
  ): Function {
    this.subscribers.push(callback);
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(subscriber => subscriber !== callback);
    };
  }
  private async notifySubscribers(): Promise<void> {
    const reference = this.getCart();
    // this.setState 
    //   && this.setState(this);
    this.subscribers.forEach(subscriber => subscriber(reference));
  }

  private reduceProducts(
    products: ShoppingCartProduct[]
  ): ShoppingCartProduct[] {
    // Reduce all products with the same id into a single product
    const reducedCart = products.reduce((acc, product) => {
      const existingProduct = acc.find((p) => p.id === product.id);
      if (existingProduct) {
        existingProduct.quantity += product.quantity;
      } else {
        acc.push(this.getFormattedProduct(product));
      }
      return acc;
    }, [] as ShoppingCartProduct[]);

    return reducedCart;
  }

  private reduceShops(shops: ShoppingCartShop[]): ShoppingCartShop[] {
    // Reduce all products with the same id into a single object
    const reducedShops = shops.reduce((acc, shop) => {
      const existingShop = acc.find((s) => s.id === shop.id);
      if (existingShop) {
        existingShop.products = this.reduceProducts([
          ...existingShop.products,
          ...shop.products,
        ]);
      } else {
        acc.push({
          ...shop,
          products: this.reduceProducts(shop.products),
        });
      }
      return acc;
    }, [] as ShoppingCartShop[]);

    return reducedShops;
  }

  private getFormattedProduct(product: ShoppingCartProduct): ShoppingCartProduct {
    return {
      id: product.id,
      name: product.name,
      image: product.image,
      users_id: product.users_id,
      price: product.price,
      activateDiscount: product.activateDiscount,
      discount: product.discount,
      hasFreeShipping: product.hasFreeShipping,
      brand: product.brand,
      modelo: product.modelo,
      delivery_time: product.delivery_time,
      quantity: parseInt(product.quantity.toString(), 10)
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
      activateDiscount: false,
      discount: 0,
      hasFreeShipping: false,
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
          shippingQuotes: [],
          selectedShippingMethod: null,
          timestamp: new Date().toISOString(),
        },
      ];
    } else {
      // If the shop is in the cart, try to find the product
      const existingProduct =
        shop.products.find((p) => p.id === formattedProduct.id) || formattedProduct;
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
      this.cart.push(shop);
    }

    // Update state callback
    this.notifySubscribers();

    // Return the list of products
    return this.getCart().cart;
  }

  private buildShoppingCartObject = (): ShoppingCartType => {
    console.log("this.cart", this.cart);
    console.log("this.shipping", this.shipping);
    return {
      cart: this.cart,
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
    const calculatedAmount: number = this.cart.reduce(
      (shopTotal, shop) =>
        shopTotal +
        (shop.selectedShippingMethod ? shop.selectedShippingMethod.amount : 0),
      0
    );

    // return this.products.some((p) => p.hasFreeShipping) ? 0 : 10;
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
    return this.products;
  }

  /**
   * Get the list of items in the shopping cart.
   * @returns The items in the shopping cart.
   */
  public getCart(): ShoppingCartType {
    // Sort stores by shop name
    // const sortedShops = this.shops.sort((a, b) => {
    //   const nameA = a.name.toUpperCase();
    //   const nameB = b.name.toUpperCase();
    //   return nameA.localeCompare(nameB);
    // });
    return this.buildShoppingCartObject();//sortedShops;
  }

  /**
   * Get products count.
   * @returns The number of products in the shopping cart.
   */
  public getProductsCount(): number {
    const cart = this.getCart().cart;
    console.log("cart", cart);
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
    console.log("shipping", shipping);

    // Validate the shipping information
    if (
      !shipping ||
      !shipping.street ||
      !shipping.town_id ||
      !shipping.state_id ||
      !shipping.zipcode ||
      !shipping.neighborhood ||
      !shipping.num_ext ||
      !shipping.phone ||
      !shipping.email ||
      !shipping.name ||
      !shipping.lastname
    ) {
      throw new Error("Invalid shipping information");
    }

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
      street: shipping.street,
      town_id: Number(shipping.town_id),
      state_id: Number(shipping.state_id),
      zipcode: Number(shipping.zipcode),
      num_ext: shipping.num_ext,
      num_int: shipping.num_int,
      neighborhood: shipping.neighborhood,
      phone: shipping.phone,
      email: shipping.email,
      name: shipping.name,
      lastname: shipping.lastname,
      cityName: shipping.cityName,
      stateName: shipping.stateName
    };
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
    const sortedQuotes = quotes.map((quote:ShippingQuote) => {
      quote.deliveries = quote.deliveries.sort(
        (a, b) => a.amount - b.amount
      );
      return quote;
    });

    // Find the matching shop and add the shipping quotes
    this.cart = this.cart.map((shop) => {
      const matchingQuote = sortedQuotes.find(
        (quote: any) => quote.to_users_id === shop.id
      );
      if (matchingQuote) {
        shop.shippingQuotes = [matchingQuote] || [];
        shop.selectedShippingMethod = matchingQuote.deliveries[0] || null;
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
    const shop = this.cart.find((s) => s.id === shopId);
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
   * Clear the shopping cart.
   * @returns The empty shopping cart.
   * @throws {Error} If the shopping cart is not available.
   */
  public clear(): ShoppingCartType {
    // Clear the shopping cart
    this.cart = [];
    this.shipping = defaultShipping;

    // Update state callback
    this.notifySubscribers();

    // Remove all sobscribers
    this.subscribers = [];

    // Return the empty shopping cart
    return this.getCart();
  }
}

export default ShoppingCart;
