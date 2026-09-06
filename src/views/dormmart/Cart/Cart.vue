<template>
  <section class="cart-page">
    <article class="cart-list">
      <header class="cart-list__header">
        <div>
          <h1>{{ Text.Title }}</h1>
          <p>{{ CartDescription }}</p>
        </div>
        <router-link :to="ContinueShoppingRoute" class="dm-btn-ghost cart-list__continue-shopping">
          {{ ContinueShoppingLabel }}
        </router-link>
      </header>

      <div v-if="CartIsLoading" class="dm-card cart-state">Đang tải giỏ hàng...</div>
      <div v-else-if="CartErrorMessage" class="dm-card cart-state cart-state--error">{{ CartErrorMessage }}</div>

      <template v-else-if="CartLines.length">
        <div class="cart-list__selection dm-card">
          <label class="cart-check">
            <input
              type="checkbox"
              :checked="IsAllSelected"
              :aria-label="Text.SelectAll"
              @change="toggleAll($event.target.checked)"
            />
            <span>{{ formatI18nText(Text.CartProductCount, { count: CartSummary.ItemCount }) }}</span>
          </label>
          <button
            type="button"
            class="cart-list__clear"
            :disabled="!SelectedItems.length"
            @click="removeSelectedItems"
          >
            Xóa đã chọn
          </button>
        </div>

        <div class="cart-items">
          <article v-for="CartItem in CartLines" :key="`${CartItem.Type}-${CartItem.Id}`" class="cart-item dm-card">
            <div class="cart-item__check">
              <label class="cart-check">
                <input
                  type="checkbox"
                  :checked="SelectedItemIds.includes(CartItem.Id)"
                  :aria-label="formatI18nText(Text.SelectProductLabel, { name: CartItem.Name })"
                  @change="toggleItem(CartItem.Id, $event.target.checked)"
                />
              </label>
            </div>

            <router-link :to="getLineRoute(CartItem)" class="cart-item__image">
              <img :src="getLineImage(CartItem)" :alt="CartItem.Name" />
            </router-link>

            <div class="cart-item__content">
              <div class="cart-item__top">
                <div>
                  <div class="cart-item__title-row">
                    <router-link :to="getLineRoute(CartItem)" class="cart-item__name">{{ CartItem.Name }}</router-link>
                    <span v-if="isCombo(CartItem)" class="cart-item__combo-badge">Combo</span>
                    <span v-if="getComboSaving(CartItem) > 0" class="cart-item__discount-badge">
                      -{{ formatCurrency(getComboSaving(CartItem)) }}
                    </span>
                  </div>
                  <p class="cart-item__subtitle">{{ getLineSubtitle(CartItem) }}</p>
                  <p class="cart-item__meta">{{ CartItem.Meta }}</p>
                </div>
                <button
                  type="button"
                  class="cart-item__remove-button"
                  :aria-label="formatI18nText(Text.RemoveProductLabel, { name: CartItem.Name })"
                  @click="removeItem(CartItem)"
                >
                  <span class="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
              </div>

              <div v-if="isCombo(CartItem) && CartItem.Items.length" class="cart-item__combo-box">
                <p>Sản phẩm trong combo</p>
                <ul class="cart-item__combo-items">
                  <li v-for="Item in CartItem.Items.slice(0, 3)" :key="Item.ProductVariantId">
                    <span class="cart-item__combo-dot"></span>
                    <span>{{ Item.Quantity }}x {{ Item.ProductName }}</span>
                  </li>
                </ul>
              </div>

              <div class="cart-item__bottom">
                <div class="cart-item__price-wrap">
                  <strong class="cart-item__price">{{ formatCurrency(CartItem.LineTotal) }}</strong>
                  <span v-if="CartItem.OriginalLineTotal > CartItem.LineTotal" class="cart-item__original-price">
                    {{ formatCurrency(CartItem.OriginalLineTotal) }}
                  </span>
                </div>

                <div class="cart-quantity">
                  <button
                    type="button"
                    class="cart-quantity__button"
                    :aria-label="Text.DecreaseQuantity"
                    :disabled="CartItem.Quantity <= 1"
                    @click="changeQuantity(CartItem, -1)"
                  >
                    <span class="material-symbols-outlined" aria-hidden="true">remove</span>
                  </button>
                  <strong>{{ CartItem.Quantity }}</strong>
                  <button
                    type="button"
                    class="cart-quantity__button"
                    :aria-label="Text.IncreaseQuantity"
                    :disabled="CartItem.Quantity >= CartItem.AvailableStock"
                    @click="changeQuantity(CartItem, 1)"
                  >
                    <span class="material-symbols-outlined" aria-hidden="true">add</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </template>

      <div v-else class="cart-empty dm-card">
        <span class="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
        <h2>{{ Text.EmptyTitle }}</h2>
        <p>{{ CartCombos.length ? 'Hãy thêm combo phù hợp cho nhu cầu của bạn.' : Text.EmptyDescription }}</p>
        <router-link :to="ContinueShoppingRoute" class="dm-btn">
          {{ CartCombos.length ? 'Khám phá combo' : Text.ExploreProducts }}
        </router-link>
      </div>
    </article>

    <aside class="cart-summary dm-card">
      <h2>{{ Text.SummaryTitle }}</h2>
      <div class="cart-summary__rows">
        <div>
          <span>{{ formatI18nText(Text.CartProductCount, { count: SelectedQuantity || CartSummary.ItemCount }) }}</span>
          <strong>{{ formatCurrency(SubtotalAmount) }}</strong>
        </div>
        <div>
          <span>{{ Text.Shipping }}</span>
          <strong class="cart-summary__shipping">{{ Text.Free }}</strong>
        </div>
        <div v-if="ComboDiscountAmount > 0">
          <span>Giảm giá combo</span>
          <strong class="cart-summary__discount">-{{ formatCurrency(ComboDiscountAmount) }}</strong>
        </div>
      </div>
      <div class="cart-summary__total">
        <span>{{ Text.Total }}</span>
        <div>
          <strong>{{ formatCurrency(TotalAmount) }}</strong>
          <small>(Đã bao gồm VAT)</small>
        </div>
      </div>
      <DMButton type="none" :is-tooltip="false" class="cart-summary__checkout" icon-name="payments" :message="formatI18nText(Text.CheckoutWithCount, { count: SelectedQuantity })" :un-active="SelectedItems.length === 0" @click="navigateToCheckout" />
      <div class="cart-summary__trust">
        <div>
          <span class="material-symbols-outlined" aria-hidden="true">verified_user</span>
          <small>Bảo mật 100%</small>
        </div>
        <div>
          <span class="material-symbols-outlined" aria-hidden="true">local_shipping</span>
          <small>{{ Text.ShippingNote }}</small>
        </div>
        <div>
          <span class="material-symbols-outlined" aria-hidden="true">sync_alt</span>
          <small>Đổi trả theo chính sách cửa hàng</small>
        </div>
      </div>
    </aside>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import {
  CartCombos,
  CartErrorMessage,
  CartIsLoading,
  CartItems,
  CartSummary,
  changeCartComboQuantity,
  changeCartItemQuantity,
  deleteCartCombo,
  deleteCartItem,
  loadCart,
} from "@/stores/cartStore";
import { formatI18nText } from "@/utils/i18n";
import { formatCurrency } from "@/utils/shopFormatters";

const Router = useRouter();
const Text = inject("i18nCommon").Cart;
const SelectedItemIds = ref([]);

const CartLines = computed(() => ([
  ...CartItems.value.map((CartItem) => ({
    Type: "Item",
    Id: CartItem.CartItemId,
    Slug: CartItem.ProductSlug,
    Name: CartItem.ProductName,
    Code: CartItem.VariantName,
    Meta: [CartItem.Color, CartItem.Size].filter(Boolean).join(" • ") || "Mặc định",
    ImageUrl: CartItem.PrimaryImageUrl,
    Quantity: CartItem.Quantity,
    AvailableStock: CartItem.AvailableStock,
    LineTotal: CartItem.LineTotal,
    OriginalLineTotal: CartItem.OriginalLineTotal || CartItem.LineTotal,
    Items: [],
  })),
  ...CartCombos.value.map((CartCombo) => ({
    Type: "Combo",
    Id: CartCombo.CartComboId,
    Slug: CartCombo.Slug,
    Name: CartCombo.Name,
    Code: CartCombo.ComboCode,
    Meta: `${CartCombo.Items?.length || 0} món`,
    ImageUrl: CartCombo.ImageUrl,
    Quantity: CartCombo.Quantity,
    AvailableStock: CartCombo.AvailableStock,
    LineTotal: CartCombo.LineTotal,
    OriginalLineTotal: (CartCombo.OriginalPrice || 0) * (CartCombo.Quantity || 0),
    OriginalPrice: CartCombo.OriginalPrice,
    ComboPrice: CartCombo.ComboPrice,
    Items: CartCombo.Items || [],
  })),
]));

const SelectedItems = computed(() => CartLines.value.filter((CartItem) => SelectedItemIds.value.includes(CartItem.Id)));
const SelectedQuantity = computed(() => SelectedItems.value.reduce((Total, CartItem) => Total + CartItem.Quantity, 0));
const SubtotalAmount = computed(() => SelectedItems.value.reduce((Total, CartItem) => Total + CartItem.LineTotal, 0));
const ShippingAmount = computed(() => 0);
const ComboDiscountAmount = computed(() => SelectedItems.value.reduce((Total, CartItem) => Total + getComboSaving(CartItem), 0));
const TotalAmount = computed(() => SubtotalAmount.value + ShippingAmount.value);
const IsAllSelected = computed(() => CartLines.value.length > 0 && SelectedItemIds.value.length === CartLines.value.length);
const ContinueShoppingRoute = computed(() => (CartCombos.value.length && !CartItems.value.length ? { name: "comboList" } : { name: "productList" }));
const ContinueShoppingLabel = computed(() => (CartCombos.value.length && !CartItems.value.length ? "Xem combo khác" : Text.ContinueShopping));
const CartDescription = computed(() => formatI18nText(Text.SelectedCount, { count: SelectedQuantity.value || CartSummary.value.ItemCount }));

const syncSelectedItems = () => {
  SelectedItemIds.value = CartLines.value.map((CartItem) => CartItem.Id);
};

const toggleItem = (CartItemId, IsSelected) => {
  SelectedItemIds.value = IsSelected
    ? [...new Set([...SelectedItemIds.value, CartItemId])]
    : SelectedItemIds.value.filter((ItemId) => ItemId !== CartItemId);
};

const toggleAll = (IsSelected) => {
  SelectedItemIds.value = IsSelected ? CartLines.value.map((CartItem) => CartItem.Id) : [];
};

const changeQuantity = async (CartItem, Delta) => {
  const NextQuantity = Math.max(1, CartItem.Quantity + Delta);
  if (NextQuantity === CartItem.Quantity) {
    return;
  }

  if (CartItem.Type === "Combo") {
    await changeCartComboQuantity(CartItem.Id, NextQuantity);
  } else {
    await changeCartItemQuantity(CartItem.Id, NextQuantity);
  }
};

const removeItem = async (CartItem) => {
  if (CartItem.Type === "Combo") {
    await deleteCartCombo(CartItem.Id);
  } else {
    await deleteCartItem(CartItem.Id);
  }

  SelectedItemIds.value = SelectedItemIds.value.filter((ItemId) => ItemId !== CartItem.Id);
};

const removeSelectedItems = async () => {
  const Targets = [...SelectedItems.value];
  if (!Targets.length) {
    return;
  }

  for (const CartItem of Targets) {
    await removeItem(CartItem);
  }
};

const navigateToCheckout = () => Router.push({ name: "payment" });
const getLineRoute = (CartItem) => (CartItem.Type === "Combo"
  ? { name: "comboDetail", params: { slug: CartItem.Slug } }
  : { name: "productDetail", params: { slug: CartItem.Slug } });
const getLineImage = (CartItem) => CartItem.ImageUrl || "https://placehold.co/240x240?text=No+Image";
const getLineSubtitle = (CartItem) => (CartItem.Type === "Combo"
  ? CartItem.Code
  : formatI18nText(Text.ProductCodeValue, { code: CartItem.Code }));
const isCombo = (CartItem) => CartItem.Type === "Combo";
const getComboSaving = (CartItem) => Math.max(0, (CartItem.OriginalLineTotal || 0) - (CartItem.LineTotal || 0));

onMounted(async () => {
  await loadCart();
  syncSelectedItems();
});
</script>

<style scoped lang="scss" src="@/assets/styles/screens/cart.scss"></style>
