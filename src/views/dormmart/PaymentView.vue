<script setup>
import { computed, inject, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import DMRadio from "@/components/base/DMRadio.vue";
import DMTextarea from "@/components/base/DMTextarea.vue";
import PaymentData from "@/data/paymentData.json";

const Text = inject("i18nCommon").Payment;
const SelectedShippingMethodId = ref(2);
const SelectedPaymentMethodId = ref(1);
const OrderNote = ref("");
const SelectedAddressId = ref(1);
const IsAddressListVisible = ref(false);
const SelectedVoucherId = ref(null);
const IsVoucherListVisible = ref(false);
const VoucherSearch = ref("");
const VoucherMessage = ref("");
const OrderResult = reactive({ IsSuccess: false, OrderCode: "" });
const ShippingOptions = PaymentData.ShippingMethods.map((ShippingItem) => ({ ...ShippingItem, value: ShippingItem.ShippingMethodId, label: ShippingItem.ShippingName }));
const PaymentOptions = PaymentData.PaymentMethods.filter((PaymentItem) => PaymentItem.IsActive).map((PaymentItem) => ({ ...PaymentItem, value: PaymentItem.PaymentMethodId, label: PaymentItem.PaymentName }));
const SelectedAddress = computed(() => PaymentData.Addresses.find((AddressItem) => AddressItem.AddressId === SelectedAddressId.value) ?? PaymentData.Addresses[0]);
const SelectedShippingMethod = computed(() => PaymentData.ShippingMethods.find((ShippingItem) => ShippingItem.ShippingMethodId === SelectedShippingMethodId.value));
const MerchandiseSubtotal = computed(() => PaymentData.CheckoutItems.reduce((Total, Item) => Total + Item.UnitPrice * Item.Quantity, 0));
const SelectedVoucher = computed(() => PaymentData.Vouchers.find((VoucherItem) => VoucherItem.VoucherId === SelectedVoucherId.value));
const FilteredVouchers = computed(() => {
  const SearchValue = VoucherSearch.value.trim().toLowerCase();
  if (!SearchValue) return PaymentData.Vouchers;
  return PaymentData.Vouchers.filter((VoucherItem) => VoucherItem.VoucherCode.toLowerCase().includes(SearchValue) || VoucherItem.VoucherName.toLowerCase().includes(SearchValue));
});
const DiscountAmount = computed(() => {
  if (!SelectedVoucher.value) return 0;
  if (SelectedVoucher.value.DiscountType === "PERCENTAGE") return Math.min(MerchandiseSubtotal.value * SelectedVoucher.value.DiscountValue / 100, SelectedVoucher.value.MaximumDiscountAmount);
  if (SelectedVoucher.value.DiscountType === "SHIPPING_AMOUNT") return Math.min(SelectedShippingMethod.value.ShippingFee, SelectedVoucher.value.DiscountValue);
  return SelectedVoucher.value.DiscountValue;
});
const TotalPayment = computed(() => MerchandiseSubtotal.value + SelectedShippingMethod.value.ShippingFee - DiscountAmount.value);

const formatCurrency = (Amount) => new Intl.NumberFormat(Text.CurrencyLocale, { style: "currency", currency: Text.CurrencyCode }).format(Amount);
const formatDate = (DateValue) => new Intl.DateTimeFormat(Text.DateLocale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${DateValue}T00:00:00`));
const getDeliveryRange = (ShippingMethod) => ShippingMethod.EstimatedFromDate === ShippingMethod.EstimatedToDate ? formatDate(ShippingMethod.EstimatedFromDate) : `${formatDate(ShippingMethod.EstimatedFromDate)} - ${formatDate(ShippingMethod.EstimatedToDate)}`;
const selectAddress = (AddressId) => { SelectedAddressId.value = AddressId; IsAddressListVisible.value = false; };
const selectVoucher = (VoucherId) => { SelectedVoucherId.value = VoucherId; VoucherMessage.value = ""; IsVoucherListVisible.value = false; };
const removeVoucher = () => { SelectedVoucherId.value = null; };
const applyVoucherCode = () => {
  const VoucherCode = VoucherSearch.value.trim().toUpperCase();
  const VoucherItem = PaymentData.Vouchers.find((Item) => Item.VoucherCode === VoucherCode && Item.IsActive);
  if (!VoucherItem || MerchandiseSubtotal.value < VoucherItem.MinimumOrderAmount) { VoucherMessage.value = Text.VoucherNotFound; IsVoucherListVisible.value = true; return; }
  selectVoucher(VoucherItem.VoucherId);
};
const placeOrder = () => {
  OrderResult.OrderCode = `DM${Date.now().toString().slice(-8)}`;
  OrderResult.IsSuccess = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
};
</script>

<template>
  <section class="payment-page">
    <header class="payment-page__heading"><h1>{{ Text.PageTitle }}</h1></header>
    <div v-if="OrderResult.IsSuccess" class="payment-success dm-card" role="status">
      <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
      <strong>{{ Text.OrderSuccess }} {{ OrderResult.OrderCode }}</strong>
    </div>

    <article class="payment-section payment-address dm-card">
      <div class="payment-section__title"><span class="material-symbols-outlined" aria-hidden="true">location_on</span><h2>{{ Text.AddressTitle }}</h2></div>
      <div class="payment-address__content">
        <strong>{{ SelectedAddress.RecipientName }} · {{ SelectedAddress.Phone }}</strong>
        <p>{{ SelectedAddress.AddressLine }}</p>
        <span class="dm-pill">{{ Text.DefaultAddress }}</span>
        <DMButton type="none" :is-tooltip="false" :message="Text.ChangeAddress" class="payment-link-button" @click="IsAddressListVisible = !IsAddressListVisible" />
        <div v-if="IsAddressListVisible" class="address-list">
          <button v-for="AddressItem in PaymentData.Addresses" :key="AddressItem.AddressId" type="button" class="address-item" :class="{ 'address-item--active': SelectedAddressId === AddressItem.AddressId }" @click="selectAddress(AddressItem.AddressId)">
            <span class="material-symbols-outlined" aria-hidden="true">{{ AddressItem.AddressType === 'Nhà riêng' ? 'home' : AddressItem.AddressType === 'Văn phòng' ? 'apartment' : 'school' }}</span>
            <span><strong>{{ AddressItem.RecipientName }} · {{ AddressItem.Phone }}</strong><small>{{ AddressItem.AddressType }}</small><p>{{ AddressItem.AddressLine }}</p></span>
            <span class="address-item__status">{{ SelectedAddressId === AddressItem.AddressId ? Text.SelectedAddress : Text.UseAddress }}</span>
          </button>
        </div>
      </div>
    </article>

    <article class="payment-section dm-card">
      <div class="payment-section__title"><span class="material-symbols-outlined" aria-hidden="true">shopping_bag</span><h2>{{ Text.ProductTitle }}</h2></div>
      <div class="payment-products__header"><span>{{ Text.ProductTitle }}</span><span>{{ Text.UnitPrice }}</span><span>{{ Text.Quantity }}</span><span>{{ Text.ItemTotal }}</span></div>
      <div v-for="Item in PaymentData.CheckoutItems" :key="Item.CheckoutItemId" class="payment-product">
        <img :src="Item.ImageUrl" :alt="Item.ProductName" />
        <div><strong>{{ Item.ProductName }}</strong><span>{{ Item.VariantName }}</span></div>
        <span>{{ formatCurrency(Item.UnitPrice) }}</span><span>{{ Item.Quantity }}</span><strong>{{ formatCurrency(Item.UnitPrice * Item.Quantity) }}</strong>
      </div>
    </article>

    <article class="payment-section dm-card">
      <div class="payment-section__title"><span class="material-symbols-outlined" aria-hidden="true">local_shipping</span><h2>{{ Text.ShippingTitle }}</h2></div>
      <DMRadio v-model="SelectedShippingMethodId" class="payment-radio" name="shipping-method" :options="ShippingOptions">
        <template #option="{ option: ShippingItem }">
          <div class="shipping-method">
            <div><strong>{{ ShippingItem.ShippingName }}</strong><span v-if="ShippingItem.IsRecommended" class="dm-pill">{{ Text.Recommended }}</span></div>
            <p>{{ ShippingItem.ShippingDescription }}</p>
            <div class="shipping-method__details"><span>{{ Text.ReceiveDate }}: <strong>{{ getDeliveryRange(ShippingItem) }}</strong></span><span>{{ Text.ShippingFee }}: <strong>{{ formatCurrency(ShippingItem.ShippingFee) }}</strong></span></div>
          </div>
        </template>
      </DMRadio>
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
          <DMButton v-if="SelectedVoucher" type="none" :is-tooltip="false" :message="Text.RemoveVoucher" class="payment-voucher__remove" @click="removeVoucher" />
          <DMButton type="none" :is-tooltip="false" :message="Text.SelectVoucher" class="payment-voucher__select" @click="IsVoucherListVisible = !IsVoucherListVisible" />
        </div>
        <div class="payment-voucher__search">
          <DMInput v-model="VoucherSearch" :placeholder="Text.VoucherSearchPlaceholder" @keyup.enter="applyVoucherCode" />
          <DMButton type="none" :is-tooltip="false" :message="Text.SearchVoucher" class="payment-voucher__apply" @click="applyVoucherCode" />
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
          <div><span>{{ Text.MerchandiseSubtotal }}</span><strong>{{ formatCurrency(MerchandiseSubtotal) }}</strong></div>
          <div><span>{{ Text.ShippingSubtotal }}</span><strong>{{ formatCurrency(SelectedShippingMethod.ShippingFee) }}</strong></div>
          <div><span>{{ Text.Discount }}</span><strong class="payment-summary__discount">-{{ formatCurrency(DiscountAmount) }}</strong></div>
          <div class="payment-summary__total"><span>{{ Text.TotalPayment }}</span><strong>{{ formatCurrency(TotalPayment) }}</strong></div>
        </div>
        <div class="payment-summary__action"><DMButton type="none" :is-tooltip="false" :message="Text.PlaceOrder" class="payment-summary__submit" @click="placeOrder" /><p>{{ Text.TermsNotice }}</p></div>
      </div>
    </aside>
  </section>
</template>

<style scoped src="@/assets/styles/screens/payment.css"></style>
