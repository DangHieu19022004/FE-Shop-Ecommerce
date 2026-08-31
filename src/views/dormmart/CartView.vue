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
    Meta: CartItem.Color || CartItem.Size || "Mặc định",
    ImageUrl: CartItem.PrimaryImageUrl,
    Quantity: CartItem.Quantity,
    AvailableStock: CartItem.AvailableStock,
    LineTotal: CartItem.LineTotal,
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
    OriginalPrice: CartCombo.OriginalPrice,
    ComboPrice: CartCombo.ComboPrice,
    Items: CartCombo.Items || [],
  })),
]));

const SelectedItems = computed(() => CartLines.value.filter((CartItem) => SelectedItemIds.value.includes(CartItem.Id)));
const SelectedQuantity = computed(() => SelectedItems.value.reduce((Total, CartItem) => Total + CartItem.Quantity, 0));
const SubtotalAmount = computed(() => SelectedItems.value.reduce((Total, CartItem) => Total + CartItem.LineTotal, 0));
const ShippingAmount = computed(() => 0);
const TotalAmount = computed(() => SubtotalAmount.value + ShippingAmount.value);
const IsAllSelected = computed(() => CartLines.value.length > 0 && SelectedItemIds.value.length === CartLines.value.length);

const syncSelectedItems = () => {
  SelectedItemIds.value = CartLines.value.map((CartItem) => CartItem.Id);
};

const toggleItem = (CartItemId, IsSelected) => {
  SelectedItemIds.value = IsSelected
    ? [...SelectedItemIds.value, CartItemId]
    : SelectedItemIds.value.filter((ItemId) => ItemId !== CartItemId);
};

const toggleAll = (IsSelected) => {
  SelectedItemIds.value = IsSelected ? CartLines.value.map((CartItem) => CartItem.Id) : [];
};

const changeQuantity = async (CartItem, Delta) => {
  const NextQuantity = Math.max(1, CartItem.Quantity + Delta);
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

const navigateToCheckout = () => Router.push({ name: "payment" });
const getLineRoute = (CartItem) => (CartItem.Type === "Combo"
  ? { name: "comboDetail", params: { slug: CartItem.Slug } }
  : { name: "productDetail", params: { slug: CartItem.Slug } });
const getLineImage = (CartItem) => CartItem.ImageUrl || "https://placehold.co/240x240?text=No+Image";
const getLineSubtitle = (CartItem) => (CartItem.Type === "Combo" ? CartItem.Code : `${Text.ProductCode}: ${CartItem.Code}`);
const getLineStockText = (CartItem) => (CartItem.Type === "Combo"
  ? `${CartItem.AvailableStock} combo khả dụng`
  : `${CartItem.AvailableStock} ${Text.InStock}`);
const isCombo = (CartItem) => CartItem.Type === "Combo";
const getComboSaving = (CartItem) => Math.max(0, ((CartItem.OriginalPrice || 0) - (CartItem.ComboPrice || 0)) * (CartItem.Quantity || 0));

onMounted(async () => {
  await loadCart();
  syncSelectedItems();
});
</script>

<template>
  <section class="cart-page">
    <article class="cart-list dm-card">
      <header class="cart-list__header">
        <div>
          <h1>{{ Text.Title }}</h1>
          <p>{{ SelectedQuantity }} {{ Text.SelectedSuffix }}</p>
        </div>
        <router-link :to="CartCombos.length && !CartItems.length ? { name: 'comboList' } : { name: 'productList' }" class="dm-btn-ghost">
          {{ CartCombos.length && !CartItems.length ? 'Xem combo khác' : Text.ContinueShopping }}
        </router-link>
      </header>

      <div v-if="CartIsLoading" class="dm-card" style="padding: 16px; text-align: center;">Đang tải giỏ hàng...</div>
      <div v-else-if="CartErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ CartErrorMessage }}</div>

      <template v-else-if="CartLines.length">
        <div class="cart-list__selection">
          <input type="checkbox" :checked="IsAllSelected" @change="toggleAll($event.target.checked)" />
          <span>{{ CartSummary.ItemCount }} {{ Text.ProductSuffix }}</span>
        </div>

        <div class="cart-items">
          <article v-for="CartItem in CartLines" :key="`${CartItem.Type}-${CartItem.Id}`" class="cart-item">
            <input
              type="checkbox"
              :checked="SelectedItemIds.includes(CartItem.Id)"
              :aria-label="`${Text.SelectProduct} ${CartItem.Name}`"
              @change="toggleItem(CartItem.Id, $event.target.checked)"
            />

            <router-link :to="getLineRoute(CartItem)" class="cart-item__image">
              <img :src="getLineImage(CartItem)" :alt="CartItem.Name" />
            </router-link>

            <div class="cart-item__information">
              <div v-if="isCombo(CartItem)" class="cart-item__combo-badge">Combo</div>
              <router-link :to="getLineRoute(CartItem)" class="cart-item__name">{{ CartItem.Name }}</router-link>
              <span>{{ getLineSubtitle(CartItem) }}</span>
              <span>{{ CartItem.Meta }}</span>
              <ul v-if="isCombo(CartItem) && CartItem.Items.length" class="cart-item__combo-items">
                <li v-for="Item in CartItem.Items.slice(0, 3)" :key="Item.ProductVariantId">
                  {{ Item.ProductName }} × {{ Item.Quantity }}
                </li>
              </ul>
              <small v-if="isCombo(CartItem) && getComboSaving(CartItem) > 0" class="cart-item__saving">
                Tiết kiệm {{ formatCurrency(getComboSaving(CartItem)) }}
              </small>
              <div class="cart-item__mobile-price">{{ formatCurrency(CartItem.LineTotal) }}</div>
            </div>

            <div class="cart-quantity">
              <DMButton
                type="none"
                :is-tooltip="false"
                class="cart-quantity__button"
                icon-name="remove"
                :aria-label="Text.DecreaseQuantity"
                :un-active="CartItem.Quantity <= 1"
                @click="changeQuantity(CartItem, -1)"
              />
              <strong>{{ CartItem.Quantity }}</strong>
              <DMButton
                type="none"
                :is-tooltip="false"
                class="cart-quantity__button"
                icon-name="add"
                :aria-label="Text.IncreaseQuantity"
                :un-active="CartItem.Quantity >= CartItem.AvailableStock"
                @click="changeQuantity(CartItem, 1)"
              />
              <small>{{ getLineStockText(CartItem) }}</small>
            </div>

            <strong class="cart-item__price">{{ formatCurrency(CartItem.LineTotal) }}</strong>
            <DMButton
              type="none"
              :is-tooltip="false"
              class="cart-item__remove"
              icon-name="delete"
              :aria-label="`${Text.Remove} ${CartItem.Name}`"
              @click="removeItem(CartItem)"
            />
          </article>
        </div>
      </template>

      <div v-else class="cart-empty">
        <span class="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
        <h2>{{ Text.EmptyTitle }}</h2>
        <p>{{ CartCombos.length ? 'Hãy thêm combo phù hợp cho nhu cầu của bạn.' : Text.EmptyDescription }}</p>
        <router-link :to="CartCombos.length ? { name: 'comboList' } : { name: 'productList' }" class="dm-btn">
          {{ CartCombos.length ? 'Khám phá combo' : Text.ExploreProducts }}
        </router-link>
      </div>
    </article>

    <aside class="cart-summary dm-card">
      <h2>{{ Text.SummaryTitle }}</h2>
      <div class="cart-summary__rows">
        <div><span>{{ Text.Subtotal }}</span><strong>{{ formatCurrency(SubtotalAmount) }}</strong></div>
        <div><span>{{ Text.Shipping }}</span><strong class="cart-summary__shipping">{{ Text.Free }}</strong></div>
        <div class="cart-summary__total"><span>{{ Text.Total }}</span><strong>{{ formatCurrency(TotalAmount) }}</strong></div>
      </div>
      <DMButton
        type="none"
        :is-tooltip="false"
        class="cart-summary__checkout"
        icon-name="payments"
        :message="`${Text.Checkout} (${SelectedQuantity})`"
        :un-active="SelectedItems.length === 0"
        @click="navigateToCheckout"
      />
      <div class="cart-summary__note"><span class="material-symbols-outlined" aria-hidden="true">local_shipping</span>{{ Text.ShippingNote }}</div>
    </aside>
  </section>
</template>
