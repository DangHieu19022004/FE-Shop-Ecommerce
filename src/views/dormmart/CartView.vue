<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import {
  CartErrorMessage,
  CartIsLoading,
  CartItems,
  CartSummary,
  changeCartItemQuantity,
  deleteCartItem,
  loadCart,
} from "@/stores/cartStore";
import { formatCurrency } from "@/utils/shopFormatters";

const Router = useRouter();
const Text = inject("i18nCommon").Cart;
const SelectedItemIds = ref([]);

const SelectedItems = computed(() => CartItems.value.filter((CartItem) => SelectedItemIds.value.includes(CartItem.CartItemId)));
const SelectedQuantity = computed(() => SelectedItems.value.reduce((Total, CartItem) => Total + CartItem.Quantity, 0));
const SubtotalAmount = computed(() => SelectedItems.value.reduce((Total, CartItem) => Total + CartItem.LineTotal, 0));
const ShippingAmount = computed(() => 0);
const TotalAmount = computed(() => SubtotalAmount.value + ShippingAmount.value);
const IsAllSelected = computed(() => CartItems.value.length > 0 && SelectedItemIds.value.length === CartItems.value.length);

const syncSelectedItems = () => {
  SelectedItemIds.value = CartItems.value.map((CartItem) => CartItem.CartItemId);
};

const changeQuantity = async (CartItemId, Delta, CurrentQuantity) => {
  await changeCartItemQuantity(CartItemId, Math.max(1, CurrentQuantity + Delta));
};

const removeItem = async (CartItemId) => {
  await deleteCartItem(CartItemId);
  SelectedItemIds.value = SelectedItemIds.value.filter((ItemId) => ItemId !== CartItemId);
};

const toggleItem = (CartItemId, IsSelected) => {
  SelectedItemIds.value = IsSelected
    ? [...SelectedItemIds.value, CartItemId]
    : SelectedItemIds.value.filter((ItemId) => ItemId !== CartItemId);
};

const toggleAll = (IsSelected) => {
  SelectedItemIds.value = IsSelected ? CartItems.value.map((CartItem) => CartItem.CartItemId) : [];
};

const navigateToCheckout = () => Router.push({ name: "payment" });

onMounted(async () => {
  await loadCart();
  syncSelectedItems();
});
</script>

<template>
  <section class="cart-page">
    <article class="cart-list dm-card">
      <header class="cart-list__header">
        <div><h1>{{ Text.Title }}</h1><p>{{ SelectedQuantity }} {{ Text.SelectedSuffix }}</p></div>
        <router-link :to="{ name: 'productList' }" class="dm-btn-ghost">{{ Text.ContinueShopping }}</router-link>
      </header>
      <div v-if="CartIsLoading" class="dm-card" style="padding: 16px; text-align: center;">Đang tải giỏ hàng...</div>
      <div v-else-if="CartErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ CartErrorMessage }}</div>
      <div v-else-if="CartItems.length" class="cart-list__selection">
        <input type="checkbox" :checked="IsAllSelected" @change="toggleAll($event.target.checked)" />
        <span>{{ CartSummary.ItemCount }} {{ Text.ProductSuffix }}</span>
      </div>
      <div v-if="CartItems.length" class="cart-items">
        <article v-for="CartItem in CartItems" :key="CartItem.CartItemId" class="cart-item">
          <input type="checkbox" :checked="SelectedItemIds.includes(CartItem.CartItemId)" :aria-label="`${Text.SelectProduct} ${CartItem.ProductName}`" @change="toggleItem(CartItem.CartItemId, $event.target.checked)" />
          <router-link :to="{ name: 'productDetail', params: { slug: CartItem.ProductSlug } }" class="cart-item__image"><img :src="CartItem.PrimaryImageUrl || 'https://placehold.co/240x240?text=No+Image'" :alt="CartItem.ProductName" /></router-link>
          <div class="cart-item__information">
            <router-link :to="{ name: 'productDetail', params: { slug: CartItem.ProductSlug } }" class="cart-item__name">{{ CartItem.ProductName }}</router-link>
            <span>{{ Text.ProductCode }}: {{ CartItem.VariantName }}</span>
            <span>{{ CartItem.Color || CartItem.Size || 'Mặc định' }}</span>
            <div class="cart-item__mobile-price">{{ formatCurrency(CartItem.LineTotal) }}</div>
          </div>
          <div class="cart-quantity">
            <DMButton type="none" :is-tooltip="false" class="cart-quantity__button" icon-name="remove" :aria-label="Text.DecreaseQuantity" :un-active="CartItem.Quantity <= 1" @click="changeQuantity(CartItem.CartItemId, -1, CartItem.Quantity)" />
            <strong>{{ CartItem.Quantity }}</strong>
            <DMButton type="none" :is-tooltip="false" class="cart-quantity__button" icon-name="add" :aria-label="Text.IncreaseQuantity" :un-active="CartItem.Quantity >= CartItem.AvailableStock" @click="changeQuantity(CartItem.CartItemId, 1, CartItem.Quantity)" />
            <small>{{ CartItem.AvailableStock }} {{ Text.InStock }}</small>
          </div>
          <strong class="cart-item__price">{{ formatCurrency(CartItem.LineTotal) }}</strong>
          <DMButton type="none" :is-tooltip="false" class="cart-item__remove" icon-name="delete" :aria-label="`${Text.Remove} ${CartItem.ProductName}`" @click="removeItem(CartItem.CartItemId)" />
        </article>
      </div>
      <div v-else-if="!CartIsLoading" class="cart-empty">
        <span class="material-symbols-outlined" aria-hidden="true">shopping_cart</span><h2>{{ Text.EmptyTitle }}</h2><p>{{ Text.EmptyDescription }}</p>
        <router-link :to="{ name: 'productList' }" class="dm-btn">{{ Text.ExploreProducts }}</router-link>
      </div>
    </article>
    <aside class="cart-summary dm-card">
      <h2>{{ Text.SummaryTitle }}</h2>
      <div class="cart-summary__rows">
        <div><span>{{ Text.Subtotal }}</span><strong>{{ formatCurrency(SubtotalAmount) }}</strong></div>
        <div><span>{{ Text.Shipping }}</span><strong class="cart-summary__shipping">{{ Text.Free }}</strong></div>
        <div class="cart-summary__total"><span>{{ Text.Total }}</span><strong>{{ formatCurrency(TotalAmount) }}</strong></div>
      </div>
      <DMButton type="none" :is-tooltip="false" class="cart-summary__checkout" icon-name="payments" :message="`${Text.Checkout} (${SelectedQuantity})`" :un-active="SelectedItems.length === 0" @click="navigateToCheckout" />
      <div class="cart-summary__note"><span class="material-symbols-outlined" aria-hidden="true">local_shipping</span>{{ Text.ShippingNote }}</div>
    </aside>
  </section>
</template>
