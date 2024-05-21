import { I18n } from "i18n-js";
import es from "i18n-js/json/es.json";

// Note the syntax of these imports from the date-fns library.
// If you import with the syntax: import { format } from "date-fns" the ENTIRE library
// will be included in your production bundle (even if you only use one function).
// This is because react-native does not support tree-shaking.
import type { Locale } from "date-fns"
import format from "date-fns/format"
const i18n = new I18n();


export const formatPrice = (price: string | number, options = {}) => {

  const priceOptions = {
    ...options,
  }
  return i18n.numberToCurrency(Number(price) || 0, priceOptions)
}
