<script setup>
import { computed, inject, onMounted, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import DMRadio from "@/components/base/DMRadio.vue";
import DMTextarea from "@/components/base/DMTextarea.vue";
import { getMyAddresses } from "@/services/authService";
import { checkoutOrder, getActiveVouchers } from "@/services/checkoutService";
import { getShippingQuote } from "@/services/adminService";
import { CartItems, CartSummary, loadCart } from "@/stores/cartStore";
import { formatAddress, formatCurrency, formatDate } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").Payment;
const SelectedPaymentMethodId = ref(0);
const OrderNote = ref("");
const Addresses = ref([]);
const Vouchers = ref([]);
const SelectedAddressId = ref("");
const SelectedVoucherId = ref("");
const VoucherSearch = ref("");
const VoucherMessage = ref("");
const ErrorMessage = ref("");
const SuccessMessage = ref("");
const IsSubmitting = ref(false);
const IsVoucherListVisible = ref(false);
const ShippingQuote = ref(null);
const ShippingQuoteMessage = ref("");
const PaymentOptions = [
  { value: 0, label: "COD", PaymentName: "COD", PaymentDescription: "Thanh toán khi nhận hàng", IconName: "payments" },
  { value: 1, label: "Bank Transfer", PaymentName: "Chuyển khoản", PaymentDescription: "Chuyển khoản thủ công", IconName: "account_balance" },
  { value: 2, label: "Gateway", PaymentName: "Cổng thanh toán", PaymentDescription: "Thanh toán qua cổng", IconName: "credit_card" },
];
const MerchandiseSubtotal = computed(() => CartSummary.value.Subtotal || 0);
const SelectedVoucher = computed(() =>
  Vouchers.value.find((VoucherItem) => VoucherItem.VoucherId === SelectedVoucherId.value) || null,
);
const FilteredVouchers = computed(() => {
  const Keyword = VoucherSearch.value.trim().toLowerCase();
  if (!Keyword) return Vouchers.value;

  return Vouchers.value.filter((VoucherItem) =>
    [VoucherItem.Code, VoucherItem.VoucherCode].some((Value) => String(Value || "").toLowerCase().includes(Keyword)),
  );
});
const SelectedAddress = computed(() =>
  Addresses.value.find((AddressItem) => AddressItem.UserAddressId === SelectedAddressId.value) || null,
);
const VoucherDiscountPreview = computed(() => {
  if (!SelectedVoucher.value) return 0;

  if (Number(SelectedVoucher.value.DiscountType) === 0) {
    const RawDiscount = MerchandiseSubtotal.value * (Number(SelectedVoucher.value.DiscountValue) || 0) / 100;
    const MaxDiscount = SelectedVoucher.value.MaxDiscountAmount == null ? null : Number(SelectedVoucher.value.MaxDiscountAmount);
    return MaxDiscount == null ? RawDiscount : Math.min(RawDiscount, MaxDiscount);
  }

  return Number(SelectedVoucher.value.DiscountValue) || 0;
});
const ShippingFee = computed(() => Number(ShippingQuote.value?.Fee || 0));
const EstimatedTotal = computed(() => Math.max(MerchandiseSubtotal.value + ShippingFee.value - VoucherDiscountPreview.value, 0));
const IsVoucherEligible = computed(() => {
  if (!SelectedVoucher.value) return true;
  return MerchandiseSubtotal.value >= (SelectedVoucher.value.MinimumOrderAmount || 0);
});
const CanPlaceOrder = computed(() => !IsSubmitting.value && Boolean(SelectedAddressId.value));

const resetCheckoutState = () => {
  SelectedVoucherId.value = "";
  VoucherSearch.value = "";
  VoucherMessage.value = "";
  ShippingQuote.value = null;
  ShippingQuoteMessage.value = "";
};

const loadCheckoutData = async () => {
  ErrorMessage.value = "";
  VoucherMessage.value = "";
  ShippingQuoteMessage.value = "";

  try {
    const [_, AddressData, VoucherData] = await Promise.all([
      loadCart(),
      getMyAddresses(),
      getActiveVouchers(),
    ]);
    Addresses.value = AddressData;
    Vouchers.value = VoucherData.map((VoucherItem) => ({
      ...VoucherItem,
      VoucherCode: VoucherItem.Code,
      VoucherName: VoucherItem.Code,
      VoucherDescription: VoucherItem.DiscountType === 0
        ? `Giảm ${VoucherItem.DiscountValue}%`
        : `Giảm ${formatCurrency(VoucherItem.DiscountValue)}`,
      ExpiryDate: VoucherItem.ExpiresAt,
      MinimumOrderAmount: VoucherItem.MinOrderAmount || 0,
    }));
    SelectedAddressId.value = Addresses.value.find((AddressItem) => AddressItem.IsDefault)?.UserAddressId || Addresses.value[0]?.UserAddressId || "";
    await loadShippingQuote(AddressData);
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const loadShippingQuote = async (AddressData = Addresses.value) => {
  const SelectedAddressData = AddressData.find((AddressItem) => AddressItem.UserAddressId === SelectedAddressId.value)
    || AddressData.find((AddressItem) => AddressItem.IsDefault)
    || AddressData[0];

  if (!SelectedAddressData) {
    ShippingQuote.value = null;
    ShippingQuoteMessage.value = "Chưa có địa chỉ để tính phí vận chuyển.";
    return;
  }

  try {
    ShippingQuote.value = await getShippingQuote({
      Province: SelectedAddressData.Province || "",
      District: SelectedAddressData.District || "",
      Items: CartItems.value.map((Item) => ({
        ProductVariantId: Item.ProductVariantId,
        Quantity: Item.Quantity,
      })),
    });
    ShippingQuoteMessage.value = "Đã lấy phí vận chuyển ước tính từ API.";
  } catch (Error) {
    ShippingQuote.value = null;
    ShippingQuoteMessage.value = Error.message;
  }
};

const handleSelectAddress = async (AddressId) => {
  SelectedAddressId.value = AddressId;
  await loadShippingQuote();
};

const selectVoucher = (VoucherId) => {
  SelectedVoucherId.value = VoucherId;
  VoucherMessage.value = "Đã áp dụng voucher cho đơn hàng hiện tại.";
  IsVoucherListVisible.value = false;
};

const removeVoucher = () => {
  SelectedVoucherId.value = "";
  VoucherMessage.value = "Đã gỡ voucher khỏi đơn hàng.";
};

const applyVoucherCode = () => {
  const Keyword = VoucherSearch.value.trim().toLowerCase();
  const MatchedVoucher = Vouchers.value.find((VoucherItem) =>
    String(VoucherItem.VoucherCode || "").toLowerCase() === Keyword,
  );

  if (!MatchedVoucher) {
    VoucherMessage.value = Text.VoucherNotFound;
    return;
  }

  if (MerchandiseSubtotal.value < (MatchedVoucher.MinimumOrderAmount || 0)) {
    VoucherMessage.value = `Đơn tối thiểu ${formatCurrency(MatchedVoucher.MinimumOrderAmount)} để áp dụng voucher này.`;
    return;
  }

  selectVoucher(MatchedVoucher.VoucherId);
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
      VoucherCode: SelectedVoucher.value?.VoucherCode || null,
      Note: OrderNote.value || null,
    });
    SuccessMessage.value = `Đặt hàng thành công: ${Result.OrderCode || Result.Order?.OrderCode || ""}`;
    resetCheckoutState();
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
    <header class="payment-page__heading">
      <h1>{{ Text.PageTitle }}</h1>
      <p>Hoàn tất đơn hàng bằng dữ liệu thật từ địa chỉ, voucher và phí vận chuyển hiện có.</p>
    </header>

    <div v-if="ErrorMessage" class="payment-alert payment-alert--danger dm-card" role="alert">
      <span class="material-symbols-outlined" aria-hidden="true">error</span>
      <strong>{{ ErrorMessage }}</strong>
    </div>
    <div v-if="SuccessMessage" class="payment-alert payment-alert--success dm-card" role="status">
      <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
      <strong>{{ SuccessMessage }}</strong>
    </div>

    <article class="payment-section payment-address dm-card">
      <div class="payment-section__title"><span class="material-symbols-outlined" aria-hidden="true">location_on</span><h2>{{ Text.AddressTitle }}</h2></div>
      <div v-if="Addresses.length" class="payment-address__content">
        <button v-for="AddressItem in Addresses" :key="AddressItem.UserAddressId" type="button" class="address-item" :class="{ 'address-item--active': SelectedAddressId === AddressItem.UserAddressId }" @click="handleSelectAddress(AddressItem.UserAddressId)">
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

      <div class="payment-shipping-status">
        <div class="payment-shipping-status__header">
          <strong>{{ Text.ShippingTitle }}</strong>
          <span class="dm-pill payment-shipping-status__pill">{{ SelectedAddress?.Province || 'Chưa chọn địa chỉ' }}</span>
        </div>
        <div v-if="ShippingQuote" class="payment-shipping-status__body">
          <div>
            <span class="payment-shipping-status__label">Đơn vị</span>
            <strong>{{ ShippingQuote.Provider || '-' }}</strong>
          </div>
          <div>
            <span class="payment-shipping-status__label">Phí dự kiến</span>
            <strong>{{ formatCurrency(ShippingQuote.Fee || 0) }}</strong>
          </div>
          <div>
            <span class="payment-shipping-status__label">Thời gian</span>
            <strong>{{ ShippingQuote.EstimatedDays || '-' }} ngày</strong>
          </div>
        </div>
        <div v-else class="payment-shipping-status__empty">Chưa có báo giá vận chuyển.</div>
        <small class="payment-shipping-status__message">{{ ShippingQuoteMessage }}</small>
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
          <DMButton v-if="SelectedVoucher" type="none" :is-tooltip="false" class="payment-voucher__remove" icon-name="close" :aria-label="Text.RemoveVoucher" :title="Text.RemoveVoucher" @click="removeVoucher" />
          <DMButton type="none" :is-tooltip="false" class="payment-voucher__select" icon-name="confirmation_number" :message="Text.SelectVoucher" @click="IsVoucherListVisible = !IsVoucherListVisible" />
        </div>
        <div class="payment-voucher__summary">
          <div>
            <span class="payment-voucher__label">Trạng thái</span>
            <strong>{{ SelectedVoucher ? (IsVoucherEligible ? 'Đã sẵn sàng áp dụng' : 'Chưa đủ điều kiện') : 'Chưa chọn voucher' }}</strong>
          </div>
          <div>
            <span class="payment-voucher__label">Giảm dự kiến</span>
            <strong>{{ SelectedVoucher && IsVoucherEligible ? formatCurrency(VoucherDiscountPreview) : '-' }}</strong>
          </div>
          <div>
            <span class="payment-voucher__label">Đơn tối thiểu</span>
            <strong>{{ SelectedVoucher ? formatCurrency(SelectedVoucher.MinimumOrderAmount || 0) : '-' }}</strong>
          </div>
        </div>
        <div class="payment-voucher__search">
          <DMInput v-model="VoucherSearch" :placeholder="Text.VoucherSearchPlaceholder" @keyup.enter="applyVoucherCode" />
          <DMButton type="none" :is-tooltip="false" class="payment-voucher__apply" icon-name="search" :message="Text.SearchVoucher" @click="applyVoucherCode" />
        </div>
        <p v-if="VoucherMessage" class="payment-voucher__message" :class="{ 'payment-voucher__message--success': SelectedVoucher && IsVoucherEligible }" role="alert">{{ VoucherMessage }}</p>
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
          <div><span>{{ Text.ShippingSubtotal }}</span><strong>{{ formatCurrency(ShippingFee) }}</strong></div>
          <div v-if="SelectedVoucher && IsVoucherEligible" class="payment-summary__discount"><span>Giảm từ voucher</span><strong>-{{ formatCurrency(VoucherDiscountPreview) }}</strong></div>
          <div class="payment-summary__total"><span>Tổng ước tính</span><strong>{{ formatCurrency(EstimatedTotal) }}</strong></div>
          <small class="payment-summary__note">Tổng trên là ước tính từ cart + shipping quote + voucher hiện chọn. Checkout thật vẫn do backend chốt.</small>
        </div>
        <div class="payment-summary__action"><DMButton type="none" :is-tooltip="false" class="payment-summary__submit" icon-name="shopping_bag" :message="IsSubmitting ? 'Đang đặt hàng...' : Text.PlaceOrder" :un-active="!CanPlaceOrder" @click="placeOrder" /><p>{{ Text.TermsNotice }}</p></div>
      </div>
    </aside>
  </section>
</template>

<style scoped src="@/assets/styles/screens/payment.css"></style>
