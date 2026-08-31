<template>
  <section class="order-history">
    <header class="order-history__heading"><div><h1>{{ Text.PageTitle }}</h1><p>{{ Text.PageSubtitle }}</p></div><div class="order-history__search"><DMInput v-model="SearchValue" :placeholder="Text.SearchPlaceholder" /><span class="material-symbols-outlined" aria-hidden="true">search</span></div></header>
    <nav class="order-status-tabs" :aria-label="Text.PageTitle">
      <DMButton v-for="StatusItem in StatusFilters" :key="StatusItem.StatusCode" type="none" :is-tooltip="false" class="order-status-tabs__button" :class="{ 'order-status-tabs__button--active': SelectedStatusCode === StatusItem.StatusCode }" :icon-name="StatusItem.IconName" :message="StatusItem.StatusName" @click="SelectedStatusCode = StatusItem.StatusCode" />
    </nav>
    <div v-if="IsLoading" class="order-empty dm-card"><h2>Đang tải đơn hàng...</h2></div>
    <div v-else-if="ErrorMessage" class="order-empty dm-card"><h2>{{ ErrorMessage }}</h2></div>
    <div v-else-if="FilteredOrders.length" class="order-list">
      <article v-for="OrderItem in FilteredOrders" :key="OrderItem.OrderId" class="order-card dm-card">
        <header class="order-card__header"><div><strong>{{ formatI18nText(Text.OrderCodeValue, { code: OrderItem.OrderCode }) }}</strong><span>{{ formatI18nText(Text.OrderedAtValue, { date: formatDate(OrderItem.CreateDate) }) }}</span></div><span class="order-status">{{ OrderItem.Status }}</span></header>
        <footer class="order-card__footer"><div><span>{{ formatI18nText(Text.ProductCountValue, { count: OrderItem.ItemCount }) }}</span><strong>{{ formatI18nText(Text.TotalAmountValue, { amount: formatCurrency(OrderItem.Total) }) }}</strong></div><router-link :to="{ name: 'orderDetail', params: { orderCode: OrderItem.OrderCode } }" class="dm-btn">{{ Text.ViewDetail }}</router-link></footer>
      </article>
    </div>
    <div v-else class="order-empty dm-card"><span class="material-symbols-outlined" aria-hidden="true">receipt_long</span><h2>{{ Text.EmptyTitle }}</h2><p>{{ Text.EmptyDescription }}</p></div>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import { getOrders } from "@/services/orderService";
import { formatI18nText } from "@/utils/i18n";
import { formatCurrency, formatDate } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").OrderHistory;
const Orders = ref([]);
const SelectedStatusCode = ref("ALL");
const SearchValue = ref("");
const IsLoading = ref(false);
const ErrorMessage = ref("");
const StatusFilters = computed(() => [
  { StatusCode: "ALL", StatusName: Text.AllOrders },
  ...Array.from(new Set(Orders.value.map((OrderItem) => OrderItem.Status))).map((StatusCode) => ({
    StatusCode,
    StatusName: StatusCode,
  })),
]);
const FilteredOrders = computed(() => Orders.value.filter((OrderItem) => {
  const SearchText = `${OrderItem.OrderCode} ${OrderItem.Status}`.toLowerCase();
  const IsStatusMatched = SelectedStatusCode.value === "ALL" || OrderItem.Status === SelectedStatusCode.value;
  return IsStatusMatched && SearchText.includes(SearchValue.value.trim().toLowerCase());
}));

const loadOrderHistory = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    Orders.value = await getOrders();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

onMounted(loadOrderHistory);
</script>
