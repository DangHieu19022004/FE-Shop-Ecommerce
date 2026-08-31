<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import DMTextarea from "@/components/base/DMTextarea.vue";
import { cancelOrder, getOrders, getOrderById } from "@/services/orderService";
import { uploadPaymentProof } from "@/services/adminService";
import { createReview, getProductReviews } from "@/services/expansionService";
import { formatAddress, formatCurrency, formatDateTime } from "@/utils/shopFormatters";

const Route = useRoute();
const Text = inject("i18nCommon").OrderDetail;
const Order = ref(null);
const ReviewSummaries = ref({});
const ReviewForms = ref({});
const IsLoading = ref(false);
const ErrorMessage = ref("");
const ActionMessage = ref("");
const IsUploadingProof = ref(false);

const loadOrderDetail = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const Orders = await getOrders();
    const Summary = Orders.find((OrderItem) => OrderItem.OrderCode === Route.params.orderCode);
    if (!Summary) {
      Order.value = null;
      return;
    }

    Order.value = await getOrderById(Summary.OrderId);
    await Promise.all((Order.value?.Items || []).map(async (Item) => {
      ReviewForms.value[Item.OrderItemId] = ReviewForms.value[Item.OrderItemId] || { Rating: 5, Title: "", Content: "" };
      try {
        ReviewSummaries.value[Item.ProductId] = await getProductReviews(Item.ProductId);
      } catch {
        // ponytail: skip per-product review summary failure on order detail; add inline retry when review UX matters.
      }
    }));
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

const handleCancelOrder = async () => {
  if (!Order.value) return;

  try {
    Order.value = await cancelOrder(Order.value.OrderId);
    ActionMessage.value = "Đã gửi yêu cầu hủy đơn.";
  } catch (Error) {
    ActionMessage.value = Error.message;
  }
};

const IsCancelable = computed(() => ["PendingApproval"].includes(Order.value?.Status));
const canReviewOrder = computed(() => ["Completed"].includes(Order.value?.Status));
const ProofCount = computed(() => Order.value?.Payment?.ProofCount || Order.value?.Payment?.Proofs?.length || 0);

const submitReview = async (Item) => {
  const Form = ReviewForms.value[Item.OrderItemId];
  if (!Form || !Form.Title.trim()) {
    ActionMessage.value = "Nhập tiêu đề review trước khi gửi.";
    return;
  }

  try {
    await createReview({
      ProductId: Item.ProductId,
      OrderItemId: Item.OrderItemId,
      Rating: Number(Form.Rating) || 5,
      Title: Form.Title.trim(),
      Content: Form.Content.trim() || null,
    });
    ActionMessage.value = `Đã gửi review cho ${Item.ProductName}.`;
    ReviewSummaries.value[Item.ProductId] = await getProductReviews(Item.ProductId);
  } catch (Error) {
    ActionMessage.value = Error.message;
  }
};

const handleProofChange = async (Event) => {
  const File = Event.target.files?.[0];
  const PaymentId = Order.value?.Payment?.PaymentId;
  if (!File || !PaymentId) return;

  IsUploadingProof.value = true;
  try {
    const PaymentData = await uploadPaymentProof(PaymentId, File);
    Order.value = {
      ...Order.value,
      Payment: PaymentData,
    };
    ActionMessage.value = "Đã upload payment proof.";
  } catch (Error) {
    ActionMessage.value = Error.message;
  } finally {
    Event.target.value = "";
    IsUploadingProof.value = false;
  }
};

onMounted(loadOrderDetail);
</script>

<template>
  <section v-if="IsLoading" class="order-empty dm-card">
    <h1>Đang tải đơn hàng...</h1>
  </section>
  <section v-else-if="Order" class="order-detail">
    <router-link :to="{ name: 'orderHistory' }" class="order-detail__back"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>{{ Text.BackToOrders }}</router-link>
    <div v-if="ActionMessage" class="order-detail__alert dm-card">{{ ActionMessage }}</div>
    <header class="order-detail__header dm-card">
      <div>
        <h1>{{ Order.OrderCode }}</h1>
        <p>{{ Text.CurrentStatus }}</p>
      </div><span class="order-status">{{ Order.Status }}</span>
    </header>
    <article class="order-detail__timeline dm-card">
      <h2>{{ Text.StatusJourney }}</h2>
      <div class="order-timeline">
        <div v-for="HistoryItem in Order.StatusHistories" :key="HistoryItem.OrderStatusHistoryId" class="order-timeline__item"><span class="order-timeline__icon material-symbols-outlined" aria-hidden="true">local_shipping</span>
          <div><strong>{{ HistoryItem.Status }}</strong>
            <p>{{ HistoryItem.Note || '-' }}</p><time>{{ formatDateTime(HistoryItem.CreateDate) }}</time>
          </div>
        </div>
      </div>
    </article>
    <div class="order-detail__grid">
      <article class="dm-card">
        <h2>{{ Text.DeliveryInformation }}</h2>
        <dl>
          <div>
            <dt>{{ Text.Recipient }}</dt>
            <dd>{{ Order.Address?.RecipientName }} · {{ Order.Address?.PhoneNumber }}</dd>
          </div>
          <div>
            <dt>{{ Text.ShippingAddress }}</dt>
            <dd>{{ formatAddress(Order.Address) }}</dd>
          </div>
          <div>
            <dt>{{ Text.EstimatedDelivery }}</dt>
            <dd>{{ Order.Shipment?.DeliveredAt ? formatDateTime(Order.Shipment.DeliveredAt) : '-' }}</dd>
          </div>
        </dl>
      </article>
      <article class="dm-card">
        <h2>{{ Text.PaymentInformation }}</h2>
        <dl>
          <div>
            <dt>{{ Text.ShippingMethod }}</dt>
            <dd>{{ Order.Shipment?.CarrierName || '-' }}</dd>
          </div>
          <div>
            <dt>{{ Text.PaymentMethod }}</dt>
            <dd>{{ Order.Payment?.PaymentMethod || Order.PaymentMethod }}</dd>
          </div>
          <div>
            <dt>{{ Text.TotalAmount }}</dt>
            <dd class="order-detail__total">{{ formatCurrency(Order.Total) }}</dd>
          </div>
          <div>
            <dt>Transfer content</dt>
            <dd>{{ Order.Payment?.TransferContent || '-' }}</dd>
          </div>
        </dl>
        <div class="order-detail__proof dm-card">
          <div class="order-detail__proof-head">
            <div>
              <strong>Payment proof</strong>
              <p>Upload biên lai chuyển khoản trực tiếp vào payment hiện tại.</p>
            </div>
            <span class="order-status">{{ ProofCount }} file</span>
          </div>
          <div class="order-detail__proof-meta">
            <div>
              <span>Transfer content</span>
              <strong>{{ Order.Payment?.TransferContent || '-' }}</strong>
            </div>
            <div>
              <span>Upload status</span>
              <strong>{{ IsUploadingProof ? 'Đang upload...' : 'Sẵn sàng' }}</strong>
            </div>
          </div>
          <label class="order-detail__proof-upload">
            <span>Upload payment proof</span>
            <input type="file" accept="image/*,.pdf" :disabled="IsUploadingProof || !Order.Payment?.PaymentId" @change="handleProofChange" />
          </label>
          <small>UI này gọi trực tiếp `/api/payments/{id}/proofs` để gửi multipart proof thật.</small>
        </div>
        <DMButton v-if="IsCancelable" type="none" :is-tooltip="false" :message="'Hủy đơn hàng'" class="admin-button admin-button--danger" @click="handleCancelOrder" />
      </article>
    </div>
    <article class="order-detail__products dm-card">
      <h2>{{ Text.ProductTitle }}</h2>

      <div v-if="Order.Combos?.length" class="order-detail__combo-list">
        <article v-for="Combo in Order.Combos" :key="Combo.OrderComboId" class="order-detail__product-stack">
          <div class="order-detail__product">
            <img :src="Combo.ImageUrl || 'https://placehold.co/240x240?text=No+Image'" :alt="Combo.Name" />
            <div>
              <strong>{{ Combo.Name }}</strong>
              <span>{{ Combo.ComboCode }} · x{{ Combo.Quantity }}</span>
              <small style="display: block; color: var(--dm-text-soft);">
                {{ (Combo.Items || []).map((ComboItem) => `${ComboItem.ProductName} × ${ComboItem.Quantity}`).join(', ') }}
              </small>
            </div>
            <strong>{{ formatCurrency(Combo.LineTotal) }}</strong>
          </div>
        </article>
      </div>

      <div v-for="Item in Order.Items" :key="Item.OrderItemId" class="order-detail__product-stack">
        <div class="order-detail__product"><img :src="Item.PrimaryImageUrl || 'https://placehold.co/240x240?text=No+Image'" :alt="Item.ProductName" />
          <div><strong>{{ Item.ProductName }}</strong><span>{{ Item.VariantName }} · x{{ Item.Quantity }}</span><small style="display: block; color: var(--dm-text-soft);">Review hiện có: {{ ReviewSummaries[Item.ProductId]?.ReviewCount || 0 }}</small></div><strong>{{ formatCurrency(Item.LineTotal) }}</strong>
        </div>
        <div v-if="canReviewOrder" class="order-detail__review dm-card">
          <div class="order-detail__review-head">
            <strong>Gửi review</strong>
            <small>Đánh giá nhanh từng sản phẩm ngay từ đơn đã hoàn tất.</small>
          </div>
          <div class="order-detail__review-grid">
            <DMInput v-model="ReviewForms[Item.OrderItemId].Rating" type="number" label="Rating" />
            <DMInput v-model="ReviewForms[Item.OrderItemId].Title" label="Tiêu đề review" />
          </div>
          <DMTextarea v-model="ReviewForms[Item.OrderItemId].Content" label="Nội dung review" placeholder="Chia sẻ trải nghiệm của bạn" :max-length="250" :rows="3" />
          <DMButton type="none" :is-tooltip="false" message="Gửi review" class="admin-button" @click="submitReview(Item)" />
        </div>
      </div>
    </article>
    <article v-if="Order.Shipment" class="dm-card order-detail__shipment">
      <h2>Thông tin vận chuyển</h2>
      <dl>
        <div>
          <dt>Trạng thái</dt>
          <dd>{{ Order.Shipment.Status }}</dd>
        </div>
        <div>
          <dt>Đơn vị</dt>
          <dd>{{ Order.Shipment.CarrierName || '-' }}</dd>
        </div>
        <div>
          <dt>Mã vận đơn</dt>
          <dd>{{ Order.Shipment.TrackingCode || '-' }}</dd>
        </div>
        <div>
          <dt>Ghi chú</dt>
          <dd>{{ Order.Shipment.Note || '-' }}</dd>
        </div>
      </dl>
    </article>
  </section>
  <section v-else class="order-empty dm-card">
    <h1>{{ ErrorMessage || Text.OrderNotFound }}</h1><router-link :to="{ name: 'orderHistory' }" class="dm-btn">{{ Text.BackToOrders }}</router-link>
  </section>
</template>

<style scoped lang="scss" src="@/assets/styles/screens/order-history.scss"></style>
