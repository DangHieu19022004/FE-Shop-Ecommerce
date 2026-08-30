import { computed, ref } from "vue";
import { addCartItem, getCart, removeCartItem, updateCartItemQuantity } from "@/services/cartService";
import { getProductBySlug } from "@/services/catalogService";

export const CartItems = ref([]);
export const CartSummary = ref({ CartId: "", Subtotal: 0, Total: 0, ItemCount: 0 });
export const CartIsLoading = ref(false);
export const CartErrorMessage = ref("");
export const CartTotalQuantity = computed(() =>
  CartItems.value.reduce((Total, CartItem) => Total + CartItem.Quantity, 0),
);

const applyCart = (Cart) => {
  CartItems.value = Cart?.Items || [];
  CartSummary.value = {
    CartId: Cart?.CartId || "",
    Subtotal: Cart?.Subtotal || 0,
    Total: Cart?.Total || 0,
    ItemCount: Cart?.ItemCount || 0,
  };
};

export const loadCart = async () => {
  CartIsLoading.value = true;
  CartErrorMessage.value = "";

  try {
    applyCart(await getCart());
    return CartItems.value;
  } catch (Error) {
    applyCart(null);
    CartErrorMessage.value = Error.message;
    return [];
  } finally {
    CartIsLoading.value = false;
  }
};

export const addProductToCart = async ({ ProductVariantId, Quantity = 1, ProductSlug = "" }) => {
  let TargetVariantId = ProductVariantId;

  if (!TargetVariantId && ProductSlug) {
    const Product = await getProductBySlug(ProductSlug);
    TargetVariantId = Product?.Variants?.find((VariantItem) => VariantItem.IsDefault)?.ProductVariantId
      || Product?.Variants?.[0]?.ProductVariantId
      || null;
  }

  if (!TargetVariantId) {
    throw new Error("Sản phẩm chưa có biến thể để thêm vào giỏ hàng");
  }

  const Cart = await addCartItem({ ProductVariantId: TargetVariantId, Quantity });
  applyCart(Cart);
  return Cart;
};

export const addComboToCart = async (ComboItems = []) => {
  for (const ComboItem of ComboItems) {
    await addProductToCart({
      ProductVariantId: ComboItem.ProductVariantId,
      ProductSlug: ComboItem.ProductSlug,
      Quantity: ComboItem.Quantity || 1,
    });
  }

  return CartItems.value;
};

export const changeCartItemQuantity = async (CartItemId, Quantity) => {
  const Cart = await updateCartItemQuantity(CartItemId, Quantity);
  applyCart(Cart);
  return Cart;
};

export const deleteCartItem = async (CartItemId) => {
  const Cart = await removeCartItem(CartItemId);
  applyCart(Cart);
  return Cart;
};
