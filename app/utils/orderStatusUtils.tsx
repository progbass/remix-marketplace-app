import { colors } from "tailwind/colors";

// Order status controls
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  AWAITING_PICKUP: "awaiting_pickup",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  INCIDENT: "incident",
  COMPLETED: "completed",
  CANCELED: "canceled",
  RETURNED: "returned",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
};

// Status Color Palette
export const statusColorPalette = {
    [ORDER_STATUS.PENDING]: "text-[#f4b37d]", // "#f4b37d",
    [ORDER_STATUS.PROCESSING]: "text-[#1e78d7]", // "#1e78d7",
    [ORDER_STATUS.AWAITING_PICKUP]: "text-warning-700", // colors.warning["700"],
    [ORDER_STATUS.IN_TRANSIT]: "text-[#4F46E5]", // "#4F46E5",
    [ORDER_STATUS.DELIVERED]: "text-success-800", // colors.success["800"],
    [ORDER_STATUS.COMPLETED]: "text-success-800", // colors.success["800"],
    [ORDER_STATUS.INCIDENT]: "text-warning-700", // colors.warning["700"],
    [ORDER_STATUS.CANCELED]: "text-netral-400", // colors.neutral["400"],
    [ORDER_STATUS.RETURNED]: "text-netral-400", // colors.neutral["400"],
    [ORDER_STATUS.REFUNDED]: "text-netral-400", // colors.neutral["400"],
    [ORDER_STATUS.DISPUTED]: "text-netral-400", // colors.neutral["400"],
  };

// Render Order Status Messages
export function renderOrderStatus(status:string):string {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return "Esperando confirmación del vendedor";
    case ORDER_STATUS.PROCESSING:
      return "Elaborando productos";
    case ORDER_STATUS.AWAITING_PICKUP:
      return "Esperando recolección";
    case ORDER_STATUS.IN_TRANSIT:
      return "En camino";
    case ORDER_STATUS.DELIVERED:
    case ORDER_STATUS.COMPLETED:
      return "Entregado";
    case ORDER_STATUS.INCIDENT:
      return "Incidente con la entrega";
    case ORDER_STATUS.CANCELED:
      return "Cancelado";
    case ORDER_STATUS.RETURNED:
    case ORDER_STATUS.REFUNDED:
    case ORDER_STATUS.DISPUTED:
      return "Devolución";
    default:
      return "No disponible";
  }
}