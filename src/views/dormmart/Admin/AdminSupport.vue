<script setup>
import { inject, onMounted, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import { closeAdminSupportTicket, getAdminSupportTicketById, getAdminSupportTickets, resolveAdminSupportTicket, sendAdminSupportMessage } from "@/services/adminService";
import { formatDateTime } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").AdminSupport;
const Tickets = ref([]);
const SelectedTicketId = ref("");
const SelectedTicket = ref(null);
const ReplyMessage = ref("");
const ErrorMessage = ref("");
const IsLoading = ref(false);
const IsDetailLoading = ref(false);
const IsActionPending = ref(false);

const loadTickets = async () => {
  if (IsLoading.value) return;
  try {
    IsLoading.value = true;
    ErrorMessage.value = "";
    Tickets.value = await getAdminSupportTickets();
    SelectedTicketId.value = Tickets.value[0]?.SupportTicketId || "";
    if (SelectedTicketId.value) {
      SelectedTicket.value = await getAdminSupportTicketById(SelectedTicketId.value);
    }
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

const selectTicket = async (TicketId) => {
  try {
    IsDetailLoading.value = true;
    ErrorMessage.value = "";
    SelectedTicketId.value = TicketId;
    SelectedTicket.value = await getAdminSupportTicketById(TicketId);
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsDetailLoading.value = false;
  }
};

const sendReply = async () => {
  const Message = ReplyMessage.value.trim();
  if (!SelectedTicket.value) return;
  if (!Message) {
    ErrorMessage.value = "Vui lòng nhập nội dung phản hồi.";
    return;
  }
  try {
    IsActionPending.value = true;
    ErrorMessage.value = "";
    SelectedTicket.value = await sendAdminSupportMessage(SelectedTicket.value.SupportTicketId, Message);
    ReplyMessage.value = "";
    await loadTickets();
  } catch (Error) { ErrorMessage.value = Error.message; }
  finally { IsActionPending.value = false; }
};

const resolveTicket = async () => {
  if (!SelectedTicket.value) return;
  try {
    IsActionPending.value = true;
    SelectedTicket.value = await resolveAdminSupportTicket(SelectedTicket.value.SupportTicketId);
    await loadTickets();
  } catch (Error) { ErrorMessage.value = Error.message; }
  finally { IsActionPending.value = false; }
};

const closeTicket = async () => {
  if (!SelectedTicket.value) return;
  try {
    IsActionPending.value = true;
    SelectedTicket.value = await closeAdminSupportTicket(SelectedTicket.value.SupportTicketId);
    await loadTickets();
  } catch (Error) { ErrorMessage.value = Error.message; }
  finally { IsActionPending.value = false; }
};

onMounted(loadTickets);
</script>
<template>
  <section class="admin-page">
    <header class="admin-page__header"><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div><button type="button" class="dm-btn" :disabled="IsLoading" @click="loadTickets">Tải lại dữ liệu</button></header>
    <div v-if="ErrorMessage" role="alert" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <div v-if="IsLoading" class="dm-card admin-panel" role="status">Đang tải yêu cầu hỗ trợ…</div>
    <article v-else class="dm-card admin-support">
      <div class="admin-ticket-list"><div v-if="!Tickets.length" class="admin-support-empty"><span class="material-symbols-outlined">support_agent</span><strong>Không có yêu cầu hỗ trợ</strong><p>Khi khách hàng gửi yêu cầu, hội thoại sẽ xuất hiện tại đây.</p></div><button v-for="TicketItem in Tickets" :key="TicketItem.SupportTicketId" type="button" :class="['admin-ticket', { 'admin-ticket--active': TicketItem.SupportTicketId === SelectedTicketId }]" @click="selectTicket(TicketItem.SupportTicketId)"><strong>{{ TicketItem.Subject || 'Không có tiêu đề' }}</strong><span>{{ TicketItem.UserName || 'Khách hàng' }} · {{ TicketItem.OrderCode || TicketItem.SupportTicketId }}</span><small>{{ TicketItem.Status ?? 'Chưa xác định' }}</small></button></div>
      <div v-if="SelectedTicket" class="admin-conversation"><div class="admin-panel__header"><div><h2>{{ Text.Conversation }}</h2><p>{{ SelectedTicket.UserName || 'Khách hàng' }} · {{ formatDateTime(SelectedTicket.CreateDate) }}</p></div><DMBadge warning dot>{{ SelectedTicket.Status ?? 'Chưa xác định' }}</DMBadge></div><div v-if="IsDetailLoading" role="status">Đang tải hội thoại…</div><div v-for="ReplyItem in (SelectedTicket.Messages || [])" :key="ReplyItem.SupportMessageId" :class="['admin-message', { 'admin-message--admin': String(ReplyItem.SenderType).includes('Admin') }]"><strong>{{ ReplyItem.SenderName || 'Người gửi' }}</strong><div>{{ ReplyItem.Content }}</div><small>{{ formatDateTime(ReplyItem.CreateDate) }}</small></div><div v-if="!(SelectedTicket.Messages || []).length && !IsDetailLoading" class="admin-support-empty">Chưa có tin nhắn trong hội thoại.</div><form class="admin-reply" @submit.prevent="sendReply"><DMInput v-model="ReplyMessage" :placeholder="Text.ReplyPlaceholder"/><DMButton native-type="submit" type="none" :is-tooltip="false" :message="Text.SendReply" class="admin-button" :un-active="IsActionPending"/></form><div class="admin-order-card__actions"><DMButton type="none" :is-tooltip="false" message="Đánh dấu đã xử lý" class="admin-button" :un-active="IsActionPending" @click="resolveTicket" /><DMButton type="none" :is-tooltip="false" message="Đóng yêu cầu" class="admin-button admin-button--danger" :un-active="IsActionPending" @click="closeTicket" /></div></div>
      <div v-else-if="Tickets.length" class="admin-conversation admin-support-empty"><p>{{ Text.SelectTicket }}</p></div>
    </article>
  </section>
</template>
<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>
<style scoped>
.admin-support-empty { display: grid; place-items: center; align-content: center; gap: 8px; min-height: 180px; padding: 24px; color: var(--dm-text-soft); text-align: center; }
.admin-support-empty .material-symbols-outlined { font-size: 40px; color: var(--dm-primary); }
.admin-support-empty p { margin: 0; }
</style>
