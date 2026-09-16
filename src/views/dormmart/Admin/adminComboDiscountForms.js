export const createEmptyDiscountForm = () => ({
  ComboDiscountId: "",
  DiscountType: 1,
  DiscountValue: 0,
  StartsAt: "",
  ExpiresAt: "",
  IsActive: true,
});

export const hydrateDiscountFormFromCombo = (Form, Combo) => {
  const Discount = Combo?.Discounts?.[0];
  Object.assign(Form, Discount ? {
    ComboDiscountId: Discount.ComboDiscountId,
    DiscountType: Number(Discount.DiscountType ?? 1),
    DiscountValue: Number(Discount.DiscountValue || 0),
    StartsAt: Discount.StartsAt ? String(Discount.StartsAt).slice(0, 16) : "",
    ExpiresAt: Discount.ExpiresAt ? String(Discount.ExpiresAt).slice(0, 16) : "",
    IsActive: Boolean(Discount.IsActive),
  } : createEmptyDiscountForm());
};

export const toApiLocalDateTime = (Value) => Value ? `${String(Value).slice(0, 16)}:00` : null;

export const getDiscountStatus = (Discount, Now = new Date()) => {
  if (!Discount?.IsActive) return "Inactive";
  if (Discount.StartsAt && new Date(Discount.StartsAt) > Now) return "Scheduled";
  if (Discount.ExpiresAt && new Date(Discount.ExpiresAt) <= Now) return "Expired";
  return "Active";
};
