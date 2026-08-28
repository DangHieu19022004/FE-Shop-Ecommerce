export const formatCurrency = (Amount, Locale = "vi-VN", Currency = "VND") =>
  new Intl.NumberFormat(Locale, { style: "currency", currency: Currency }).format(Amount || 0);

export const formatDate = (DateValue, Locale = "vi-VN") =>
  DateValue
    ? new Intl.DateTimeFormat(Locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(DateValue))
    : "-";

export const formatDateTime = (DateValue, Locale = "vi-VN") =>
  DateValue
    ? new Intl.DateTimeFormat(Locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(DateValue))
    : "-";

export const formatCompactNumber = (Value, Locale = "vi-VN") =>
  new Intl.NumberFormat(Locale, { notation: "compact" }).format(Value || 0);

export const formatAddress = (Address) =>
  [Address?.AddressLine, Address?.Ward, Address?.District, Address?.Province].filter(Boolean).join(", ");
