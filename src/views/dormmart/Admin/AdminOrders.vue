<template>
  <section class="admin-page">
    <header class="admin-page__header"><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div></header>
    <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <div v-if="SuccessMessage" class="dm-card" style="padding: 16px; color: var(--dm-primary);">{{ SuccessMessage }}</div>
    <div v-if="IsLoading" class="dm-card" style="padding: 16px;">Đang tải orders...</div>
    <article class="dm-card admin-panel">
      <div v-for="OrderItem in Orders" :key="OrderItem.OrderId" class="admin-order-card" style="display: grid; gap: 12px;">
        <div><strong>{{ OrderItem.OrderCode }}</strong><div class="admin-order-card__meta"><span>{{ formatCurrency(OrderItem.Total) }}</span><span>{{ OrderItem.Status }}</span><span>{{ OrderItem.PaymentStatus }}</span></div></div>
        <div class="admin-order-card__meta"><strong>Payment:</strong><span>{{ PaymentMap[OrderItem.OrderId]?.Status || '-' }}</span><strong>Shipment:</strong><span>{{ ShipmentMap[OrderItem.OrderId]?.Status || '-' }}</span></div>
        <div class="admin-order-card__actions" style="flex-wrap: wrap;">
          <DMButton type="none" :is-tooltip="false" message="Confirm" class="admin-button" @click="runOrderAction(OrderItem.OrderId, 'confirm')" />
          <DMButton type="none" :is-tooltip="false" message="Reject" class="admin-button admin-button--danger" @click="runOrderAction(OrderItem.OrderId, 'reject')" />
          <DMButton type="none" :is-tooltip="false" message="Prepare" class="admin-button" @click="runOrderAction(OrderItem.OrderId, 'prepare')" />
          <DMButton type="none" :is-tooltip="false" message="Ready" class="admin-button" @click="runOrderAction(OrderItem.OrderId, 'ready-to-ship')" />
          <DMButton type="none" :is-tooltip="false" message="Ship" class="admin-button" @click="runOrderAction(OrderItem.OrderId, 'ship')" />
          <DMButton type="none" :is-tooltip="false" message="Complete" class="admin-button" @click="runOrderAction(OrderItem.OrderId, 'complete')" />
          <DMButton type="none" :is-tooltip="false" message="Cancel" class="admin-button admin-button--danger" @click="runOrderAction(OrderItem.OrderId, 'cancel')" />
        </div>
        <div v-if="PaymentMap[OrderItem.OrderId]" class="admin-order-card__actions" style="flex-wrap: wrap;">
          <DMButton type="none" :is-tooltip="false" message="Verify payment" class="admin-button" @click="runPaymentAction(PaymentMap[OrderItem.OrderId].PaymentId, 'verify')" />
          <DMButton type="none" :is-tooltip="false" message="Mark paid" class="admin-button" @click="runPaymentAction(PaymentMap[OrderItem.OrderId].PaymentId, 'mark-paid')" />
          <DMButton type="none" :is-tooltip="false" message="Reject payment" class="admin-button admin-button--danger" @click="runPaymentAction(PaymentMap[OrderItem.OrderId].PaymentId, 'reject')" />
          <DMButton type="none" :is-tooltip="false" message="Refund" class="admin-button admin-button--danger" @click="runAdminPaymentAction(PaymentMap[OrderItem.OrderId].PaymentId, 'refund', { Reason: 'Manual admin refund' }).then(loadAdminData).catch((Error) => ErrorMessage = Error.message)" />
        </div>
        <div v-if="ShipmentMap[OrderItem.OrderId]" style="display: grid; gap: 8px;">
          <div class="admin-order-card__actions" style="flex-wrap: wrap;">
            <DMInput v-model="ShipmentForms[OrderItem.OrderId].CarrierName" label="Carrier" />
            <DMInput v-model="ShipmentForms[OrderItem.OrderId].TrackingCode" label="Tracking" />
            <DMInput v-model="ShipmentForms[OrderItem.OrderId].Note" label="Note" />
          </div>
          <div class="admin-order-card__actions" style="flex-wrap: wrap;">
            <DMButton type="none" :is-tooltip="false" message="Book manually" class="admin-button" @click="bookShipment(ShipmentMap[OrderItem.OrderId].ShipmentId, OrderItem.OrderId)" />
            <DMButton type="none" :is-tooltip="false" message="Start shipping" class="admin-button" @click="runShipmentAction(ShipmentMap[OrderItem.OrderId].ShipmentId, 'start-shipping', OrderItem.OrderId)" />
            <DMButton type="none" :is-tooltip="false" message="Delivered" class="admin-button" @click="runShipmentAction(ShipmentMap[OrderItem.OrderId].ShipmentId, 'mark-delivered', OrderItem.OrderId)" />
            <DMButton type="none" :is-tooltip="false" message="Failed" class="admin-button admin-button--danger" @click="runShipmentAction(ShipmentMap[OrderItem.OrderId].ShipmentId, 'mark-failed', OrderItem.OrderId)" />
            <DMButton type="none" :is-tooltip="false" message="Cancel shipment" class="admin-button admin-button--danger" @click="runShipmentAction(ShipmentMap[OrderItem.OrderId].ShipmentId, 'cancel', OrderItem.OrderId)" />
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import { getAdminOrders, getAdminPayments, getAdminShipments, runAdminOrderAction, runAdminPaymentAction, runAdminShipmentAction } from "@/services/adminService";
import { formatI18nText } from "@/utils/i18n";
import { formatCurrency } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").AdminOrders;
const Orders = ref([]);
const Payments = ref([]);
const Shipments = ref([]);
const ErrorMessage = ref("");
const SuccessMessage = ref("");
const IsLoading = ref(false);
const ShipmentForms = reactive({});

const PaymentMap = computed(() => Object.fromEntries(Payments.value.map((Item) => [Item.OrderId, Item])));
const ShipmentMap = computed(() => Object.fromEntries(Shipments.value.map((Item) => [Item.OrderId, Item])));

const ensureShipmentForm = (OrderId) => {
  if (!ShipmentForms[OrderId]) {
    ShipmentForms[OrderId] = { CarrierName: "", TrackingCode: "", Note: "" };
  }
  return ShipmentForms[OrderId];
};

const loadAdminData = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const [OrderData, PaymentData, ShipmentData] = await Promise.all([
      getAdminOrders(),
      getAdminPayments(),
      getAdminShipments(),
    ]);
    Orders.value = OrderData;
    Payments.value = PaymentData;
    Shipments.value = ShipmentData;
    Orders.value.forEach((Item) => ensureShipmentForm(Item.OrderId));
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

const runOrderAction = async (OrderId, Action, Note = "") => {
  try {
    await runAdminOrderAction(OrderId, Action, Note);
    SuccessMessage.value = formatI18nText(Text.OrderActionCompleted, { action: Action });
    await loadAdminData();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const runPaymentAction = async (PaymentId, Action) => {
  try {
    await runAdminPaymentAction(PaymentId, Action, {});
    SuccessMessage.value = formatI18nText(Text.PaymentActionCompleted, { action: Action });
    await loadAdminData();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const bookShipment = async (ShipmentId, OrderId) => {
  const Form = ensureShipmentForm(OrderId);
  try {
    await runAdminShipmentAction(ShipmentId, "book-manually", {
      CarrierName: Form.CarrierName,
      TrackingCode: Form.TrackingCode,
      Note: Form.Note,
      Provider: "ManualShippingProvider",
    });
    SuccessMessage.value = "Đã tạo shipment thủ công.";
    await loadAdminData();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const runShipmentAction = async (ShipmentId, Action, OrderId) => {
  const Form = ensureShipmentForm(OrderId);
  try {
    await runAdminShipmentAction(ShipmentId, Action, { Note: Form.Note });
    SuccessMessage.value = formatI18nText(Text.ShipmentActionCompleted, { action: Action });
    await loadAdminData();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

onMounted(loadAdminData);
</script>

<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>
