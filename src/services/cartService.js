import axiosInstance from "@/services/axios";

const unwrapData = (Response) => Response?.Data ?? null;

export const getCart = async () => {
  const Response = await axiosInstance.get("/cart");
  return unwrapData(Response);
};

export const addCartItem = async ({ ProductVariantId, Quantity }) => {
  const Response = await axiosInstance.post("/cart/items", { ProductVariantId, Quantity });
  return unwrapData(Response);
};

export const addCartCombo = async ({ ComboId, Quantity = 1 }) => {
  const Response = await axiosInstance.post("/cart/combos", { ComboId, Quantity });
  return unwrapData(Response);
};

export const updateCartItemQuantity = async (CartItemId, Quantity) => {
  const Response = await axiosInstance.patch(`/cart/items/${CartItemId}`, { Quantity });
  return unwrapData(Response);
};

export const updateCartComboQuantity = async (CartComboId, Quantity) => {
  const Response = await axiosInstance.patch(`/cart/combos/${CartComboId}`, { Quantity });
  return unwrapData(Response);
};

export const removeCartItem = async (CartItemId) => {
  const Response = await axiosInstance.delete(`/cart/items/${CartItemId}`);
  return unwrapData(Response);
};

export const removeCartCombo = async (CartComboId) => {
  const Response = await axiosInstance.delete(`/cart/combos/${CartComboId}`);
  return unwrapData(Response);
};

export const clearCart = async () => {
  const Response = await axiosInstance.delete("/cart/items");
  return unwrapData(Response);
};
