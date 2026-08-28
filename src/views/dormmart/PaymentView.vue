<script setup>
import { computed, inject, onMounted, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMRadio from "@/components/base/DMRadio.vue";
import DMTextarea from "@/components/base/DMTextarea.vue";
import { checkoutOrder } from "@/services/checkoutService";
import { getCurrentSession } from "@/services/authService";
import { getMyAddresses } from "@/services/authService";
import { CartItems, CartSummary, loadCart } from "@/stores/cartStore";
import { formatAddress, formatCurrency } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").Payment;
const SelectedPaymentMethodId = ref(0);
const OrderNote = ref("");
const Addresses = ref([]);
const SelectedAddressId = ref("");
const ErrorMessage = ref("");
const SuccessMessage = ref("");
const IsSubmitting = ref(false);
const PaymentOptions = [
  { value: 0, label: "COD", PaymentName: "COD", PaymentDescription: "Thanh toán khi nhận hàng", IconName: "payments" },
  { value: 1, label: "Bank Transfer", PaymentName: "Chuyển khoản", PaymentDescription: "Chuyển khoản thủ công", IconName: "account_balance" },
  { value: 2, label: "Gateway", PaymentName: "Cổng thanh toán", PaymentDescription: "Thanh toán qua cổng", IconName: "credit_card" },
];
const SelectedAddress = computed(() => Addresses.value.find((AddressItem) => AddressItem.UserAddressId === SelectedAddressId.value));

const loadCheckoutData = async () => {
  ErrorMessage.value = "";

  try {
    await loadCart();
    Addresses.value = await getMyAddresses();
    SelectedAddressId.value = Addresses.value.find((AddressItem) => AddressItem.IsDefault)?.UserAddressId || Addresses.value[0]?.UserAddressId || "";
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const placeOrder = async () => {
  if (!SelectedAddressId.value) {
    ErrorMessage.value = "Cần chọn địa chỉ nhận hàng.";
    return;
  }

  IsSubmitting.value = true;
  ErrorMessage.value = "";
  SuccessMessage.value = "";

  try {
    const Result = await checkoutOrder({
      UserAddressId: SelectedAddressId.value,
      PaymentMethod: SelectedPaymentMethodId.value,
      IdempotencyKey: crypto.randomUUID(),
      Note: OrderNote.value || null,
    });
    SuccessMessage.value = `Đặt hàng thành công: ${Result.OrderCode || Result.Order?.OrderCode || ''}`;
    await loadCart();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsSubmitting.value = false;
  }
};

onMounted(loadCheckoutData);
</script>

<template>
  <section class="payment-page">
    <header class="payment-page__heading"><h1>{{ Text.PageTitle }}</h1></header>
    <div v-if="ErrorMessage" class="payment-success dm-card" role="alert" style="color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <div v-if="SuccessMessage" class="payment-success dm-card" role="status"><span class="material-symbols-outlined" aria-hidden="true">check_circle</span><strong>{{ SuccessMessage }}</strong></div>

    <article class="payment-section payment-address dm-card">
      <div class="payment-section__title"><span class="material-symbols-outlined" aria-hidden="true">location_on</span><h2>{{ Text.AddressTitle }}</h2></div>
      <div v-if="Addresses.length" class="payment-address__content">
        <button v-for="AddressItem in Addresses" :key="AddressItem.UserAddressId" type="button" class="address-item" :class="{ 'address-item--active': SelectedAddressId === AddressItem.UserAddressId }" @click="SelectedAddressId = AddressItem.UserAddressId">
          <span class="material-symbols-outlined" aria-hidden="true">home</span>
          <span><strong>{{ AddressItem.RecipientName }} · {{ AddressItem.PhoneNumber }}</strong><p>{{ formatAddress(AddressItem) }}</p></span>
          <span class="address-item__status">{{ SelectedAddressId === AddressItem.UserAddressId ? Text.SelectedAddress : Text.UseAddress }}</span>
        </button>
      </div>
      <p v-else>Chưa có địa chỉ. Vào hồ sơ để tạo địa chỉ trước khi checkout.</p>
    </article>

    <article class="payment-section dm-card">
      <div class="payment-section__title"><span class="material-symbols-outlined" aria-hidden="true">shopping_bag</span><h2>{{ Text.ProductTitle }}</h2></div>
      <div class="payment-products__header"><span>{{ Text.ProductTitle }}</span><span>{{ Text.UnitPrice }}</span><span>{{ Text.Quantity }}</span><span>{{ Text.ItemTotal }}</span></div>
      <div v-for="Item in CartItems" :key="Item.CartItemId" class="payment-product">
        <img :src="Item.PrimaryImageUrl || 'https://placehold.co/240x240?text=No+Image'" :alt="Item.ProductName" />
        <div><strong>{{ Item.ProductName }}</strong><span>{{ Item.VariantName }}</span></div>
        <span>{{ formatCurrency(Item.UnitPrice) }}</span><span>{{ Item.Quantity }}</span><strong>{{ formatCurrency(Item.LineTotal) }}</strong>
      </div>
    </article>

    <article class="payment-section dm-card">
      <div class="payment-section__title"><span class="material-symbols-outlined" aria-hidden="true">credit_card</span><h2>{{ Text.PaymentTitle }}</h2></div>
      <DMRadio v-model="SelectedPaymentMethodId" class="payment-radio" name="payment-method" :options="PaymentOptions">
        <template #option="{ option: PaymentItem }">
          <div class="payment-method-detail"><span class="material-symbols-outlined" aria-hidden="true">{{ PaymentItem.IconName }}</span><div><strong>{{ PaymentItem.PaymentName }}</strong><p>{{ PaymentItem.PaymentDescription }}</p></div></div>
        </template>
      </DMRadio>
    </article>

    <article class="payment-section payment-extras dm-card">
      <div class="payment-voucher">
        <div class="payment-voucher__heading"><span class="material-symbols-outlined" aria-hidden="true">confirmation_number</span><div><strong>{{ Text.VoucherTitle }}</strong><p>{{ SelectedVoucher ? SelectedVoucher.VoucherName : Text.NoVoucher }}</p></div></div>
        <div class="payment-voucher__actions">
          <DMButton v-if="SelectedVoucher" type="none" :is-tooltip="false" class="payment-voucher__remove" :aria-label="Text.RemoveVoucher" :title="Text.RemoveVoucher" @click="removeVoucher"><span class="material-symbols-outlined" aria-hidden="true">close</span></DMButton>
          <DMButton type="none" :is-tooltip="false" class="payment-voucher__select" :aria-label="Text.SelectVoucher" :title="Text.SelectVoucher" @click="IsVoucherListVisible = !IsVoucherListVisible"><span class="material-symbols-outlined" aria-hidden="true">confirmation_number</span></DMButton>
        </div>
        <div class="payment-voucher__search">
          <DMInput v-model="VoucherSearch" :placeholder="Text.VoucherSearchPlaceholder" @keyup.enter="applyVoucherCode" />
          <DMButton type="none" :is-tooltip="false" class="payment-voucher__apply" :aria-label="Text.SearchVoucher" :title="Text.SearchVoucher" @click="applyVoucherCode"><span class="material-symbols-outlined" aria-hidden="true">search</span></DMButton>
        </div>
        <p v-if="VoucherMessage" class="payment-voucher__message" role="alert">{{ VoucherMessage }}</p>
        <div v-if="IsVoucherListVisible" class="voucher-list">
          <button v-for="VoucherItem in FilteredVouchers" :key="VoucherItem.VoucherId" type="button" class="voucher-item" :class="{ 'voucher-item--active': SelectedVoucherId === VoucherItem.VoucherId }" :disabled="MerchandiseSubtotal < VoucherItem.MinimumOrderAmount" @click="selectVoucher(VoucherItem.VoucherId)">
            <span class="voucher-item__icon">%</span>
            <span class="voucher-item__content"><strong>{{ VoucherItem.VoucherName }}</strong><small>{{ Text.VoucherCodeLabel }}: {{ VoucherItem.VoucherCode }}</small><small>{{ VoucherItem.VoucherDescription }}</small><small>{{ Text.VoucherExpiry }}: {{ formatDate(VoucherItem.ExpiryDate) }}</small></span>
            <span class="voucher-item__action">{{ SelectedVoucherId === VoucherItem.VoucherId ? Text.AppliedVoucher : Text.ApplyVoucher }}</span>
          </button>
          <p v-if="!FilteredVouchers.length" class="voucher-list__empty">{{ Text.VoucherNotFound }}</p>
        </div>
      </div>
      <DMTextarea v-model="OrderNote" :label="Text.OrderNoteLabel" :placeholder="Text.OrderNotePlaceholder" :max-length="250" />
    </article>

    <aside class="payment-summary dm-card">
      <h2>{{ Text.SummaryTitle }}</h2>
      <div class="payment-summary__content">
        <div class="payment-summary__rows">
          <div><span>{{ Text.MerchandiseSubtotal }}</span><strong>{{ formatCurrency(CartSummary.Subtotal) }}</strong></div>
          <div><span>{{ Text.ShippingSubtotal }}</span><strong>{{ formatCurrency(CartSummary.Total - CartSummary.Subtotal) }}</strong></div>
          <div class="payment-summary__total"><span>{{ Text.TotalPayment }}</span><strong>{{ formatCurrency(CartSummary.Total) }}</strong></div>
        </div>
        <div class="payment-summary__action"><DMButton type="none" :is-tooltip="false" class="payment-summary__submit" :aria-label="Text.PlaceOrder" :title="Text.PlaceOrder" @click="placeOrder"><span class="material-symbols-outlined" aria-hidden="true">shopping_bag</span></DMButton><p>{{ Text.TermsNotice }}</p></div>
      </div>
    </aside>
  </section>
</template>
