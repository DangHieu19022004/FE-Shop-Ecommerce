<script setup>
import { inject, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMSelect from "@/components/base/DMSelect.vue";
import AdminData from "@/data/adminData.json";

const Text = inject("i18nCommon").AdminOrders;
const Orders = ref(structuredClone(AdminData.Orders));
const StatusOptions = Object.entries(Text.Statuses).map(([Value, Label]) => ({ Value, Label }));
const formatCurrency = (Value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Value);
const updateOrder = (OrderItem) => { OrderItem.UpdatedAt = new Date().toLocaleString("vi-VN"); };
const contactCarrier = (OrderItem) => {
  if (OrderItem.CarrierName === Text.CarrierNotSelected) OrderItem.CarrierName = Text.FindingCarrier;
  OrderItem.StatusCode = "WAITING_CARRIER";
  updateOrder(OrderItem);
};
</script>
<template>
  <section class="admin-page">
    <header class="admin-page__header"><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div></header>
    <article class="dm-card admin-panel">
      <div v-for="OrderItem in Orders" :key="OrderItem.OrderId" class="admin-order-card">
        <div><strong>#{{ OrderItem.OrderId }} · {{ OrderItem.CustomerName }}</strong><div class="admin-order-card__meta"><span>{{ formatCurrency(OrderItem.TotalAmount) }}</span><span>{{ Text.UpdatedAt }}: {{ OrderItem.UpdatedAt }}</span></div></div>
        <div class="admin-order-card__meta"><strong>{{ OrderItem.CarrierName }}</strong><span>{{ OrderItem.TrackingCode || Text.NoTracking }}</span></div>
        <div class="admin-order-card__actions"><DMSelect v-model="OrderItem.StatusCode" :data="StatusOptions" option-label="Label" track-by="Value" :allow-empty="false"/><div class="admin-table-actions"><DMButton type="none" :is-tooltip="false" class="admin-button" :aria-label="Text.UpdateStatus" :title="Text.UpdateStatus" @click="updateOrder(OrderItem)"><span class="material-symbols-outlined" aria-hidden="true">sync</span></DMButton><DMButton type="none" :is-tooltip="false" class="admin-button admin-button--danger" :aria-label="Text.ContactCarrier" :title="Text.ContactCarrier" @click="contactCarrier(OrderItem)"><span class="material-symbols-outlined" aria-hidden="true">local_shipping</span></DMButton></div></div>
      </div>
    </article>
  </section>
</template>
<style scoped src="@/assets/styles/screens/admin-operations.css"></style>
