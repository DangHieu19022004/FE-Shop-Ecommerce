<script setup>
import { computed, inject } from "vue";
import { useRoute } from "vue-router";
import OrderData from "@/data/orderHistoryData.json";

const Route = useRoute();
const Text = inject("i18nCommon").OrderDetail;
const Order = computed(() => OrderData.Orders.find((OrderItem) => OrderItem.OrderCode === Route.params.orderCode));
const CurrentStatus = computed(() => OrderData.OrderStatuses.find((StatusItem) => StatusItem.OrderStatusId === Order.value?.OrderStatusId));
const OrderItems = computed(() => OrderData.OrderItems.filter((Item) => Item.OrderId === Order.value?.OrderId));
const StatusHistories = computed(() => OrderData.OrderStatusHistories.filter((Item) => Item.OrderId === Order.value?.OrderId).map((HistoryItem) => ({ ...HistoryItem, Status: OrderData.OrderStatuses.find((StatusItem) => StatusItem.OrderStatusId === HistoryItem.OrderStatusId) })).sort((FirstItem, SecondItem) => new Date(FirstItem.UpdatedAt) - new Date(SecondItem.UpdatedAt)));
const formatCurrency = (Amount) => new Intl.NumberFormat(Text.CurrencyLocale, { style: "currency", currency: Text.CurrencyCode }).format(Amount);
const formatDateTime = (DateValue) => new Intl.DateTimeFormat(Text.DateLocale, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(DateValue));
</script>

<template>
  <section v-if="Order" class="order-detail">
    <router-link :to="{ name: 'orderHistory' }" class="order-detail__back"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>{{ Text.BackToOrders }}</router-link>
    <header class="order-detail__header dm-card"><div><h1>{{ Order.OrderCode }}</h1><p>{{ Text.CurrentStatus }}</p></div><span class="order-status"><span class="material-symbols-outlined" aria-hidden="true">{{ CurrentStatus.IconName }}</span>{{ CurrentStatus.StatusName }}</span></header>
    <article class="order-detail__timeline dm-card"><h2>{{ Text.StatusJourney }}</h2><div class="order-timeline"><div v-for="HistoryItem in StatusHistories" :key="HistoryItem.OrderStatusHistoryId" class="order-timeline__item"><span class="order-timeline__icon material-symbols-outlined" aria-hidden="true">{{ HistoryItem.Status.IconName }}</span><div><strong>{{ HistoryItem.Status.StatusName }}</strong><p>{{ HistoryItem.StatusNote }}</p><time>{{ formatDateTime(HistoryItem.UpdatedAt) }}</time></div></div></div></article>
    <div class="order-detail__grid"><article class="dm-card"><h2>{{ Text.DeliveryInformation }}</h2><dl><div><dt>{{ Text.Recipient }}</dt><dd>{{ Order.RecipientName }} · {{ Order.Phone }}</dd></div><div><dt>{{ Text.ShippingAddress }}</dt><dd>{{ Order.ShippingAddress }}</dd></div><div><dt>{{ Text.EstimatedDelivery }}</dt><dd>{{ formatDateTime(Order.EstimatedDeliveryDate) }}</dd></div></dl></article><article class="dm-card"><h2>{{ Text.PaymentInformation }}</h2><dl><div><dt>{{ Text.ShippingMethod }}</dt><dd>{{ Order.ShippingMethodName }}</dd></div><div><dt>{{ Text.PaymentMethod }}</dt><dd>{{ Order.PaymentMethodName }}</dd></div><div><dt>{{ Text.TotalAmount }}</dt><dd class="order-detail__total">{{ formatCurrency(Order.TotalAmount) }}</dd></div></dl></article></div>
    <article class="order-detail__products dm-card"><h2>{{ Text.ProductTitle }}</h2><div v-for="Item in OrderItems" :key="Item.OrderItemId" class="order-detail__product"><img :src="Item.ImageUrl" :alt="Item.ProductName" /><div><strong>{{ Item.ProductName }}</strong><span>{{ Item.VariantName }} · x{{ Item.Quantity }}</span></div><strong>{{ formatCurrency(Item.UnitPrice * Item.Quantity) }}</strong></div></article>
  </section>
  <section v-else class="order-empty dm-card"><h1>{{ Text.OrderNotFound }}</h1><router-link :to="{ name: 'orderHistory' }" class="dm-btn">{{ Text.BackToOrders }}</router-link></section>
</template>

<style scoped src="@/assets/styles/screens/order-history.css"></style>
