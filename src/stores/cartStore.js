import { computed, ref } from "vue";
import {
  addCartCombo,
  addCartItem,
  getCart,
  removeCartCombo,
  removeCartItem,
  updateCartComboQuantity,
  updateCartItemQuantity,
} from "@/services/cartService";
import { getProductBySlug } from "@/services/catalogService";

export const CartItems = ref([]);
export const CartCombos = ref([]);
export const CartSummary = ref({ CartId: "", Subtotal: 0, Total: 0, ItemCount: 0 });
export const CartIsLoading = ref(false);
export const CartErrorMessage = ref("");
export const CartTotalQuantity = computed(() =>
  CartItems.value.reduce((Total, CartItem) => Total + CartItem.Quantity, 0)
  + CartCombos.value.reduce((Total, CartCombo) => Total + CartCombo.Quantity, 0),
);

const applyCart = (Cart) => {
  CartItems.value = Cart?.Items || [];
  CartCombos.value = Cart?.Combos || [];
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
    const Cart = await getCart();
    applyCart(Cart);
    return Cart;
  } catch (Error) {
    applyCart(null);
    CartErrorMessage.value = Error.message;
    return { Items: [], Combos: [] };
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

export const addComboToCart = async ({ ComboId, Quantity = 1 }) => {
  if (!ComboId) {
    throw new Error("Combo không hợp lệ");
  }

  const Cart = await addCartCombo({ ComboId, Quantity });
  applyCart(Cart);
  return Cart;
};

export const changeCartItemQuantity = async (CartItemId, Quantity) => {
  const Cart = await updateCartItemQuantity(CartItemId, Quantity);
  applyCart(Cart);
  return Cart;
};

export const changeCartComboQuantity = async (CartComboId, Quantity) => {
  const Cart = await updateCartComboQuantity(CartComboId, Quantity);
  applyCart(Cart);
  return Cart;
};

export const deleteCartItem = async (CartItemId) => {
  const Cart = await removeCartItem(CartItemId);
  applyCart(Cart);
  return Cart;
};

export const deleteCartCombo = async (CartComboId) => {
  const Cart = await removeCartCombo(CartComboId);
  applyCart(Cart);
  return Cart;
};

export const getCheckoutItems = () => ([
  ...CartItems.value.map((Item) => ({
    Type: "Item",
    Id: Item.CartItemId,
    ProductSlug: Item.ProductSlug,
    ProductName: Item.ProductName,
    VariantName: Item.VariantName,
    ImageUrl: Item.PrimaryImageUrl,
    UnitPrice: Item.UnitPrice,
    Quantity: Item.Quantity,
    LineTotal: Item.LineTotal,
  })),
  ...CartCombos.value.map((Combo) => ({
    Type: "Combo",
    Id: Combo.CartComboId,
    ProductSlug: Combo.Slug,
    ProductName: Combo.Name,
    VariantName: Combo.ComboCode,
    ImageUrl: Combo.ImageUrl,
    UnitPrice: Combo.ComboPrice,
    Quantity: Combo.Quantity,
    LineTotal: Combo.LineTotal,
    OriginalPrice: Combo.OriginalPrice,
    Items: Combo.Items || [],
  })),
]);

export const getShippingQuoteItems = () => ([
  ...CartItems.value.map((Item) => ({
    ProductVariantId: Item.ProductVariantId,
    Quantity: Item.Quantity,
  })),
  ...CartCombos.value.flatMap((Combo) =>
    (Combo.Items || []).map((Item) => ({
      ProductVariantId: Item.ProductVariantId,
      Quantity: Item.Quantity,
    }))),
]);
