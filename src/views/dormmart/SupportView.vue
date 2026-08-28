<script setup>
import { inject, onMounted, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import { createSupportTicket, getSupportTicketById, getSupportTickets, sendSupportMessage } from "@/services/supportService";
import { formatDateTime } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").SupportPage;
const TicketForm = reactive({ Subject: "", Content: "", OrderId: "" });
const Tickets = ref([]);
const SelectedTicketId = ref("");
const SelectedTicket = ref(null);
const ReplyMessage = ref("");
const ErrorMessage = ref("");
const SuccessMessage = ref("");

const loadTickets = async () => {
  try {
    Tickets.value = await getSupportTickets();
    if (!SelectedTicketId.value) {
      SelectedTicketId.value = Tickets.value[0]?.SupportTicketId || "";
    }
    if (SelectedTicketId.value) {
      SelectedTicket.value = await getSupportTicketById(SelectedTicketId.value);
    }
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const submitTicket = async () => {
  if (!TicketForm.Subject.trim() || !TicketForm.Content.trim()) return;

  try {
    const Ticket = await createSupportTicket({
      Subject: TicketForm.Subject.trim(),
      Content: TicketForm.Content.trim(),
      OrderId: TicketForm.OrderId || null,
    });
    TicketForm.Subject = "";
    TicketForm.Content = "";
    TicketForm.OrderId = "";
    SuccessMessage.value = "Đã tạo ticket hỗ trợ.";
    SelectedTicketId.value = Ticket.SupportTicketId;
    await loadTickets();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const selectTicket = async (TicketId) => {
  SelectedTicketId.value = TicketId;
  SelectedTicket.value = await getSupportTicketById(TicketId);
};

const sendReply = async () => {
  const Message = ReplyMessage.value.trim();
  if (!Message || !SelectedTicket.value) return;
  SelectedTicket.value = await sendSupportMessage(SelectedTicket.value.SupportTicketId, Message);
  ReplyMessage.value = "";
  await loadTickets();
};

onMounted(loadTickets);
</script>

<template>
  <section class="support-page">
    <header class="support-page__hero dm-card"><span class="material-symbols-outlined" aria-hidden="true">contact_support</span><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div></header>
    <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger); margin-bottom: 16px;">{{ ErrorMessage }}</div>
    <div v-if="SuccessMessage" class="dm-card" style="padding: 16px; color: var(--dm-primary); margin-bottom: 16px;">{{ SuccessMessage }}</div>
    <div class="support-page__layout">
      <div class="support-page__content">
        <article class="support-topics dm-card"><h2>Tạo ticket mới</h2><div style="display: grid; gap: 12px;"><DMInput v-model="TicketForm.Subject" label="Tiêu đề" /><DMInput v-model="TicketForm.OrderId" label="OrderId (nếu có)" /><textarea v-model="TicketForm.Content" class="dm-field" rows="5" placeholder="Mô tả vấn đề"></textarea><DMButton type="none" :is-tooltip="false" message="Tạo ticket" class="admin-button" @click="submitTicket" /></div></article>
        <article class="support-contact dm-card"><h2>Ticket của bạn</h2><div style="display: grid; gap: 8px;"><button v-for="TicketItem in Tickets" :key="TicketItem.SupportTicketId" type="button" class="admin-ticket" :class="{ 'admin-ticket--active': TicketItem.SupportTicketId === SelectedTicketId }" @click="selectTicket(TicketItem.SupportTicketId)"><strong>{{ TicketItem.Subject }}</strong><small>{{ TicketItem.Status }} · {{ TicketItem.OrderCode || TicketItem.SupportTicketId }}</small></button></div></article>
      </div>
      <aside class="support-page__chat"><div><h2>{{ Text.ChatTitle }}</h2><p>{{ Text.ChatDescription }}</p></div><div v-if="SelectedTicket" class="dm-card" style="padding: 16px; display: grid; gap: 12px;"><div><strong>{{ SelectedTicket.Subject }}</strong><div>{{ SelectedTicket.Status }}</div></div><div v-for="MessageItem in SelectedTicket.Messages" :key="MessageItem.SupportMessageId" class="admin-message" :class="{ 'admin-message--admin': String(MessageItem.SenderType).includes('Admin') }"><strong>{{ MessageItem.SenderName }}</strong><div>{{ MessageItem.Content }}</div><small>{{ formatDateTime(MessageItem.CreateDate) }}</small></div><div style="display: grid; gap: 8px;"><textarea v-model="ReplyMessage" class="dm-field" rows="4" placeholder="Nhập phản hồi"></textarea><DMButton type="none" :is-tooltip="false" message="Gửi phản hồi" class="admin-button" @click="sendReply" /></div></div><div v-else class="dm-card" style="padding: 16px;">Chọn ticket để xem hội thoại.</div></aside>
    </div>
  </section>
</template>

<style scoped src="@/assets/styles/screens/support-page.css"></style>
