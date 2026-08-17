import { computed, ref, watch } from "vue";
import CartData from "@/data/cartData.json";
import ProductData from "@/data/productDetailData.json";

const CART_STORAGE_KEY = "DORM_MART_CART";
const StoredCart = localStorage.getItem(CART_STORAGE_KEY);

export const CartItems = ref(StoredCart ? JSON.parse(StoredCart) : CartData.CartItems);
export const CartTotalQuantity = computed(() =>
  CartItems.value.reduce((Total, CartItem) => Total + CartItem.Quantity, 0),
);

export const addProductToCart = (ProductId, Quantity = 1, ProductVariantId = null) => {
  const Product = ProductData.Products.find((ProductItem) => ProductItem.ProductId === ProductId);
  if (!Product) return false;
  const ExistingItem = CartItems.value.find(
    (CartItem) =>
      CartItem.ProductId === ProductId && CartItem.ProductVariantId === ProductVariantId,
  );
  if (ExistingItem) {
    ExistingItem.Quantity = Math.min(Product.StockQuantity, ExistingItem.Quantity + Quantity);
    ExistingItem.IsSelected = true;
  } else {
    CartItems.value.push({
      CartItemId: crypto.randomUUID(),
      ProductId,
      ProductVariantId,
      Quantity: Math.min(Product.StockQuantity, Math.max(1, Quantity)),
      IsSelected: true,
      AddedAt: new Date().toISOString(),
    });
  }
  return true;
};

watch(
  CartItems,
  (CurrentCart) => localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(CurrentCart)),
  { deep: true },
);
