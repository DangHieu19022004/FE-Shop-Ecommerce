<script setup>
import { computed, inject, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import OrderData from "@/data/orderHistoryData.json";

const Text = inject("i18nCommon").OrderHistory;
const SelectedStatusCode = ref("ALL");
const SearchValue = ref("");
const StatusFilters = computed(() => [{ StatusCode: "ALL", StatusName: Text.AllOrders }, ...OrderData.OrderStatuses]);
const FilteredOrders = computed(() => OrderData.Orders.filter((OrderItem) => {
  const Status = OrderData.OrderStatuses.find((StatusItem) => StatusItem.OrderStatusId === OrderItem.OrderStatusId);
  const Items = OrderData.OrderItems.filter((Item) => Item.OrderId === OrderItem.OrderId);
  const SearchText = `${OrderItem.OrderCode} ${Items.map((Item) => Item.ProductName).join(" ")}`.toLowerCase();
  const IsStatusMatched = SelectedStatusCode.value === "ALL" || Status?.StatusCode === SelectedStatusCode.value;
  return IsStatusMatched && SearchText.includes(SearchValue.value.trim().toLowerCase());
}));

const getStatus = (OrderStatusId) => OrderData.OrderStatuses.find((StatusItem) => StatusItem.OrderStatusId === OrderStatusId);
const getOrderItems = (OrderId) => OrderData.OrderItems.filter((Item) => Item.OrderId === OrderId);
const formatCurrency = (Amount) => new Intl.NumberFormat(Text.CurrencyLocale, { style: "currency", currency: Text.CurrencyCode }).format(Amount);
const formatDate = (DateValue) => new Intl.DateTimeFormat(Text.DateLocale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(DateValue));
</script>

<template>
  <section class="order-history">
    <header class="order-history__heading"><div><h1>{{ Text.PageTitle }}</h1><p>{{ Text.PageSubtitle }}</p></div><div class="order-history__search"><DMInput v-model="SearchValue" :placeholder="Text.SearchPlaceholder" /><span class="material-symbols-outlined" aria-hidden="true">search</span></div></header>
    <nav class="order-status-tabs" :aria-label="Text.PageTitle">
      <DMButton v-for="StatusItem in StatusFilters" :key="StatusItem.StatusCode" type="none" :is-tooltip="false" :message="StatusItem.StatusName" class="order-status-tabs__button" :class="{ 'order-status-tabs__button--active': SelectedStatusCode === StatusItem.StatusCode }" @click="SelectedStatusCode = StatusItem.StatusCode" />
    </nav>
    <div v-if="FilteredOrders.length" class="order-list">
      <article v-for="OrderItem in FilteredOrders" :key="OrderItem.OrderId" class="order-card dm-card">
        <header class="order-card__header"><div><strong>{{ Text.OrderCode }}: {{ OrderItem.OrderCode }}</strong><span>{{ Text.OrderedAt }}: {{ formatDate(OrderItem.CreatedAt) }}</span></div><span class="order-status" :class="`order-status--${getStatus(OrderItem.OrderStatusId)?.StatusCode.toLowerCase().replace('_', '-')}`"><span class="material-symbols-outlined" aria-hidden="true">{{ getStatus(OrderItem.OrderStatusId)?.IconName }}</span>{{ getStatus(OrderItem.OrderStatusId)?.StatusName }}</span></header>
        <div class="order-card__items">
          <div v-for="Item in getOrderItems(OrderItem.OrderId)" :key="Item.OrderItemId" class="order-card__item"><img :src="Item.ImageUrl" :alt="Item.ProductName" /><div><strong>{{ Item.ProductName }}</strong><span>{{ Item.VariantName }}</span><span>{{ Text.QuantityPrefix }}{{ Item.Quantity }}</span></div><strong>{{ formatCurrency(Item.UnitPrice * Item.Quantity) }}</strong></div>
        </div>
        <footer class="order-card__footer"><div><span>{{ Text.EstimatedDelivery }}: {{ formatDate(OrderItem.EstimatedDeliveryDate) }}</span><strong>{{ Text.TotalAmount }}: {{ formatCurrency(OrderItem.TotalAmount) }}</strong></div><router-link :to="{ name: 'orderDetail', params: { orderCode: OrderItem.OrderCode } }" class="dm-btn">{{ Text.ViewDetail }}</router-link></footer>
      </article>
    </div>
    <div v-else class="order-empty dm-card"><span class="material-symbols-outlined" aria-hidden="true">receipt_long</span><h2>{{ Text.EmptyTitle }}</h2><p>{{ Text.EmptyDescription }}</p></div>
  </section>
</template>

<style scoped src="@/assets/styles/screens/order-history.css"></style>
