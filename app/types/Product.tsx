// Export ProductVariation type as default
export type Product = {
    id: number;
    users_id: number;
    name: string;
    categories: Array<{id: number, value: string}>;
    subcategories: Array<{id: number, value: string}>;

    // Pricing
    discount: number;
    price: number;
    pre_price: number;
    pre_price_discount: number;
    iva: number;
    price_subtotal: number;
    commission_price: number;
    activate_discount: number|boolean;

    // Main stock pros
    stock: number;
    stocktype: string;
    sku: string;
    width: number;
    high: number;
    longg: number;
    weight: number;
    models: Array<any>;

    // Shipping
    delivery_time: string;
    free_shipping: number|boolean;

    // Main gallery
    images_id: "";
    images1_id: "";
    images2_id: "";
    images3_id: "";
    imageUrl: string;
    image1Url: string;
    image2Url: string;
    image3Url: string;

    // Extas
    documentUrl: string;
    instructiveDocumentsUrl: string;
    handbookDocumentsUrl: string;
    video_url: string;
    description: string;
    short_description: string;
  };
