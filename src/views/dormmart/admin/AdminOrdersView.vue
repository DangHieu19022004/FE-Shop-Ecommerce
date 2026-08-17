<script setup>
import { inject, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMSelect from "@/components/base/DMSelect.vue";
import AdminData from "@/data/adminData.json";

const Text = inject("i18nCommon").AdminOrders;
const Orders = ref(structuredClone(AdminData.Orders));
const StatusOptions = [
  { Value: "PREPARING", Label: "Đang chuẩn bị" },
  { Value: "READY", Label: "Đã chuẩn bị xong" },
  { Value: "WAITING_CARRIER", Label: "Đợi đơn vị vận chuyển" },
  { Value: "SHIPPING", Label: "Đang giao" },
  { Value: "DELIVERED", Label: "Đã giao" },
  { Value: "CANCELLED", Label: "Đã hủy" }
];
const formatCurrency = (Value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Value);
const updateOrder = (OrderItem) => { OrderItem.UpdatedAt = new Date().toLocaleString("vi-VN"); };
const contactCarrier = (OrderItem) => {
  if (OrderItem.CarrierName === "Chưa chọn") OrderItem.CarrierName = "Đang tìm đối tác vận chuyển";
  OrderItem.StatusCode = "WAITING_CARRIER";
  updateOrder(OrderItem);
};
</script>
<template>
  <section class="admin-page">
    <header class="admin-page__header"><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div></header>
    <article class="dm-card admin-panel">
      <div v-for="OrderItem in Orders" :key="OrderItem.OrderId" class="admin-order-card">
        <div><strong>#{{ OrderItem.OrderId }} · {{ OrderItem.CustomerName }}</strong><div class="admin-order-card__meta"><span>{{ formatCurrency(OrderItem.TotalAmount) }}</span><span>Cập nhật: {{ OrderItem.UpdatedAt }}</span></div></div>
        <div class="admin-order-card__meta"><strong>{{ OrderItem.CarrierName }}</strong><span>{{ OrderItem.TrackingCode || Text.NoTracking }}</span></div>
        <div class="admin-order-card__actions"><DMSelect v-model="OrderItem.StatusCode" :data="StatusOptions" option-label="Label" track-by="Value" :allow-empty="false"/><DMButton type="none" :is-tooltip="false" :message="Text.UpdateStatus" class="admin-button" @click="updateOrder(OrderItem)"/><DMButton type="none" :is-tooltip="false" :message="Text.ContactCarrier" class="admin-button admin-button--danger" @click="contactCarrier(OrderItem)"/></div>
      </div>
    </article>
  </section>
</template>
<style scoped src="@/assets/styles/screens/admin-operations.css"></style>
