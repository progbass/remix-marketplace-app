
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(date, formatString = "dd MMMM yyyy"):string {
    return format(date, formatString, { locale: es })
}