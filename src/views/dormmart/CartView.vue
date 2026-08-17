<script setup>
import { computed, inject, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import DMCheckbox from "@/components/base/DMCheckbox.vue";
import CartData from "@/data/cartData.json";
import ProductData from "@/data/productDetailData.json";
import { addProductToCart, CartItems } from "@/stores/cartStore";

const Route = useRoute();
const Router = useRouter();
const Text = inject("i18nCommon").Cart;
const EnrichedCartItems = computed(() => CartItems.value.map((CartItem) => {
  const Product = ProductData.Products.find((ProductItem) => ProductItem.ProductId === CartItem.ProductId);
  if (!Product) return null;
  const Image = ProductData.ProductImages.find((ImageItem) => ImageItem.ProductId === Product.ProductId && ImageItem.IsPrimary);
  return { ...CartItem, Product, ImageUrl: Image?.ImageUrl ?? "" };
}).filter(Boolean));
const SelectedItems = computed(() => EnrichedCartItems.value.filter((CartItem) => CartItem.IsSelected));
const SelectedQuantity = computed(() => SelectedItems.value.reduce((Total, CartItem) => Total + CartItem.Quantity, 0));
const SubtotalAmount = computed(() => SelectedItems.value.reduce((Total, CartItem) => Total + (CartItem.Product.UnitPrice ?? 0) * CartItem.Quantity, 0));
const ShippingAmount = computed(() => SubtotalAmount.value === 0 || SubtotalAmount.value >= CartData.FreeShippingThreshold ? 0 : CartData.ShippingFee);
const TotalAmount = computed(() => SubtotalAmount.value + ShippingAmount.value);
const IsAllSelected = computed(() => CartItems.value.length > 0 && CartItems.value.every((CartItem) => CartItem.IsSelected));

const formatCurrency = (Amount) => new Intl.NumberFormat(Text.CurrencyLocale, { style: "currency", currency: Text.CurrencyCode }).format(Amount);
const changeQuantity = (CartItemId, Delta) => {
  const CartItem = CartItems.value.find((Item) => Item.CartItemId === CartItemId);
  const Product = ProductData.Products.find((Item) => Item.ProductId === CartItem?.ProductId);
  if (CartItem && Product) CartItem.Quantity = Math.min(Product.StockQuantity, Math.max(1, CartItem.Quantity + Delta));
};
const removeItem = (CartItemId) => { CartItems.value = CartItems.value.filter((CartItem) => CartItem.CartItemId !== CartItemId); };
const toggleItem = (CartItemId, IsSelected) => {
  const CartItem = CartItems.value.find((Item) => Item.CartItemId === CartItemId);
  if (CartItem) CartItem.IsSelected = IsSelected;
};
const toggleAll = (IsSelected) => CartItems.value.forEach((CartItem) => { CartItem.IsSelected = IsSelected; });
const navigateToCheckout = () => Router.push({ name: "checkout" });
const addQueryProduct = () => {
  const ProductId = Number(Route.query.ProductId);
  const Product = ProductData.Products.find((ProductItem) => ProductItem.ProductId === ProductId);
  if (!Product) return;
  const Quantity = Math.max(1, Number(Route.query.Quantity) || 1);
  const ProductVariantId = Route.query.ProductVariantId ? Number(Route.query.ProductVariantId) : null;
  addProductToCart(ProductId, Quantity, ProductVariantId);
  Router.replace({ name: "cart" });
};

onMounted(addQueryProduct);
</script>

<template>
  <section class="cart-page">
    <article class="cart-list dm-card">
      <header class="cart-list__header">
        <div><h1>{{ Text.Title }}</h1><p>{{ SelectedQuantity }} {{ Text.SelectedSuffix }}</p></div>
        <router-link :to="{ name: 'productList' }" class="dm-btn-ghost">{{ Text.ContinueShopping }}</router-link>
      </header>
      <div v-if="CartItems.length" class="cart-list__selection">
        <DMCheckbox :model-value="IsAllSelected" :label="Text.SelectAll" @update:model-value="toggleAll" />
        <span>{{ CartItems.length }} {{ Text.ProductSuffix }}</span>
      </div>
      <div v-if="EnrichedCartItems.length" class="cart-items">
        <article v-for="CartItem in EnrichedCartItems" :key="CartItem.CartItemId" class="cart-item">
          <DMCheckbox :model-value="CartItem.IsSelected" :aria-label="`${Text.SelectProduct} ${CartItem.Product.ProductName}`" @update:model-value="toggleItem(CartItem.CartItemId, $event)" />
          <router-link :to="{ name: 'productDetail', params: { slug: CartItem.Product.Slug } }" class="cart-item__image"><img :src="CartItem.ImageUrl" :alt="CartItem.Product.ProductName" /></router-link>
          <div class="cart-item__information">
            <router-link :to="{ name: 'productDetail', params: { slug: CartItem.Product.Slug } }" class="cart-item__name">{{ CartItem.Product.ProductName }}</router-link>
            <span>{{ Text.ProductCode }}: {{ CartItem.Product.ProductCode }}</span>
            <span>{{ Text.SetQuantity }}: {{ CartItem.Product.SetQuantity }}</span>
            <div class="cart-item__mobile-price">{{ CartItem.Product.UnitPrice === null ? Text.ContactPrice : formatCurrency(CartItem.Product.UnitPrice) }}</div>
          </div>
          <div class="cart-quantity">
            <DMButton type="none" :is-tooltip="false" class="cart-quantity__button" :aria-label="Text.DecreaseQuantity" :un-active="CartItem.Quantity <= 1" @click="changeQuantity(CartItem.CartItemId, -1)"><span class="material-symbols-outlined" aria-hidden="true">remove</span></DMButton>
            <strong>{{ CartItem.Quantity }}</strong>
            <DMButton type="none" :is-tooltip="false" class="cart-quantity__button" :aria-label="Text.IncreaseQuantity" :un-active="CartItem.Quantity >= CartItem.Product.StockQuantity" @click="changeQuantity(CartItem.CartItemId, 1)"><span class="material-symbols-outlined" aria-hidden="true">add</span></DMButton>
            <small>{{ CartItem.Product.StockQuantity }} {{ Text.InStock }}</small>
          </div>
          <strong class="cart-item__price">{{ CartItem.Product.UnitPrice === null ? Text.ContactPrice : formatCurrency(CartItem.Product.UnitPrice * CartItem.Quantity) }}</strong>
          <DMButton type="none" :is-tooltip="false" class="cart-item__remove" :aria-label="`${Text.Remove} ${CartItem.Product.ProductName}`" @click="removeItem(CartItem.CartItemId)"><span class="material-symbols-outlined" aria-hidden="true">delete</span></DMButton>
        </article>
      </div>
      <div v-else class="cart-empty">
        <span class="material-symbols-outlined" aria-hidden="true">shopping_cart</span><h2>{{ Text.EmptyTitle }}</h2><p>{{ Text.EmptyDescription }}</p>
        <router-link :to="{ name: 'productList' }" class="dm-btn">{{ Text.ExploreProducts }}</router-link>
      </div>
    </article>
    <aside class="cart-summary dm-card">
      <h2>{{ Text.SummaryTitle }}</h2>
      <div class="cart-summary__rows">
        <div><span>{{ Text.Subtotal }}</span><strong>{{ formatCurrency(SubtotalAmount) }}</strong></div>
        <div><span>{{ Text.Shipping }}</span><strong class="cart-summary__shipping">{{ ShippingAmount ? formatCurrency(ShippingAmount) : Text.Free }}</strong></div>
        <div class="cart-summary__total"><span>{{ Text.Total }}</span><strong>{{ formatCurrency(TotalAmount) }}</strong></div>
      </div>
      <DMButton type="none" :is-tooltip="false" :message="`${Text.Checkout} (${SelectedQuantity})`" class="cart-summary__checkout" :un-active="SelectedItems.length === 0" @click="navigateToCheckout" />
      <div class="cart-summary__note"><span class="material-symbols-outlined" aria-hidden="true">local_shipping</span>{{ Text.ShippingNote }}</div>
    </aside>
  </section>
</template>

<style scoped src="@/assets/styles/screens/cart.css"></style>
