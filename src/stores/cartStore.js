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
const toSafeNumber = (Value) => Number(Value) || 0;
export const CartTotalQuantity = computed(() => {
  const ItemQuantity = CartItems.value.reduce((Total, CartItem) => Total + toSafeNumber(CartItem.Quantity), 0);
  const ComboQuantity = CartCombos.value.reduce((Total, CartCombo) => Total + toSafeNumber(CartCombo.Quantity), 0);
  return ItemQuantity + ComboQuantity;
});

const applyCart = (Cart) => {
  CartItems.value = Array.isArray(Cart?.Items)
    ? Cart.Items.map((CartItem) => ({
      ...CartItem,
      Quantity: toSafeNumber(CartItem?.Quantity),
      AvailableStock: toSafeNumber(CartItem?.AvailableStock),
    }))
    : [];
  CartCombos.value = Array.isArray(Cart?.Combos)
    ? Cart.Combos.map((CartCombo) => ({
      ...CartCombo,
      Quantity: toSafeNumber(CartCombo?.Quantity),
      AvailableStock: toSafeNumber(CartCombo?.AvailableStock),
      Items: Array.isArray(CartCombo?.Items)
        ? CartCombo.Items.map((ComboItem) => ({
          ...ComboItem,
          Quantity: toSafeNumber(ComboItem?.Quantity),
          AvailableStock: toSafeNumber(ComboItem?.AvailableStock),
        }))
        : [],
    }))
    : [];
  CartSummary.value = {
    CartId: Cart?.CartId || "",
    Subtotal: toSafeNumber(Cart?.Subtotal),
    Total: toSafeNumber(Cart?.Total),
    ItemCount: toSafeNumber(Cart?.ItemCount),
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

const isVariantSellable = (VariantItem) => Number(VariantItem?.Status ?? 1) === 1 && Number(VariantItem?.AvailableStock ?? 0) > 0;

const resolveCartVariantId = (Product, ProductVariantId) => {
  if (ProductVariantId) {
    return ProductVariantId;
  }

  return Product?.Variants?.find((VariantItem) => VariantItem.IsDefault && isVariantSellable(VariantItem))?.ProductVariantId
    || Product?.Variants?.find(isVariantSellable)?.ProductVariantId
    || null;
};

export const addProductToCart = async ({ ProductVariantId, Quantity = 1, ProductSlug = "" }) => {
  let TargetVariantId = ProductVariantId;

  if (ProductSlug) {
    const Product = await getProductBySlug(ProductSlug);
    TargetVariantId = resolveCartVariantId(Product, ProductVariantId);
  }

  if (!TargetVariantId) {
    throw new Error("Sản phẩm đã hết hàng hoặc chưa có biến thể để thêm vào giỏ hàng");
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

export const getCartQuantityByVariantId = (ProductVariantId) => {
  if (!ProductVariantId) {
    return 0;
  }

  return CartItems.value.reduce((Total, CartItem) => Total + (CartItem.ProductVariantId === ProductVariantId ? toSafeNumber(CartItem.Quantity) : 0), 0)
    + CartCombos.value.reduce((Total, CartCombo) => Total + (CartCombo.Items || []).reduce(
      (ComboTotal, ComboItem) => ComboTotal + (ComboItem.ProductVariantId === ProductVariantId ? toSafeNumber(ComboItem.Quantity) : 0),
      0,
    ), 0);
};

export const getCartQuantityByProductSlug = (ProductSlug) => {
  if (!ProductSlug) {
    return 0;
  }

  return CartItems.value.reduce((Total, CartItem) => Total + (CartItem.ProductSlug === ProductSlug ? toSafeNumber(CartItem.Quantity) : 0), 0)
    + CartCombos.value.reduce((Total, CartCombo) => Total + (CartCombo.Items || []).reduce(
      (ComboTotal, ComboItem) => ComboTotal + (ComboItem.ProductSlug === ProductSlug ? toSafeNumber(ComboItem.Quantity) : 0),
      0,
    ), 0);
};
