<script setup>
import { computed, inject, onMounted, ref } from "vue";
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

const loadTickets = async () => {
  try {
    Tickets.value = await getAdminSupportTickets();
    SelectedTicketId.value = Tickets.value[0]?.SupportTicketId || "";
    if (SelectedTicketId.value) {
      SelectedTicket.value = await getAdminSupportTicketById(SelectedTicketId.value);
    }
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const selectTicket = async (TicketId) => {
  SelectedTicketId.value = TicketId;
  SelectedTicket.value = await getAdminSupportTicketById(TicketId);
};

const sendReply = async () => {
  const Message = ReplyMessage.value.trim();
  if (!Message || !SelectedTicket.value) return;
  SelectedTicket.value = await sendAdminSupportMessage(SelectedTicket.value.SupportTicketId, Message);
  ReplyMessage.value = "";
  await loadTickets();
};

const resolveTicket = async () => {
  if (!SelectedTicket.value) return;
  SelectedTicket.value = await resolveAdminSupportTicket(SelectedTicket.value.SupportTicketId);
  await loadTickets();
};

const closeTicket = async () => {
  if (!SelectedTicket.value) return;
  SelectedTicket.value = await closeAdminSupportTicket(SelectedTicket.value.SupportTicketId);
  await loadTickets();
};

onMounted(loadTickets);
</script>
<template>
  <section class="admin-page">
    <header class="admin-page__header"><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div></header>
    <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <article class="dm-card admin-support">
      <div class="admin-ticket-list"><button v-for="TicketItem in Tickets" :key="TicketItem.SupportTicketId" type="button" :class="['admin-ticket', { 'admin-ticket--active': TicketItem.SupportTicketId === SelectedTicketId }]" @click="selectTicket(TicketItem.SupportTicketId)"><strong>{{ TicketItem.Subject }}</strong><span>{{ TicketItem.UserName }} · {{ TicketItem.OrderCode || TicketItem.SupportTicketId }}</span><small>{{ TicketItem.Status }}</small></button></div>
      <div v-if="SelectedTicket" class="admin-conversation"><div class="admin-panel__header"><div><h2>{{ Text.Conversation }}</h2><p>{{ SelectedTicket.UserName }} · {{ formatDateTime(SelectedTicket.CreateDate) }}</p></div><span class="admin-status admin-status--warning">{{ SelectedTicket.Status }}</span></div><div v-for="ReplyItem in SelectedTicket.Messages" :key="ReplyItem.SupportMessageId" :class="['admin-message', { 'admin-message--admin': String(ReplyItem.SenderType).includes('Admin') }]"><strong>{{ ReplyItem.SenderName }}</strong><div>{{ ReplyItem.Content }}</div><small>{{ formatDateTime(ReplyItem.CreateDate) }}</small></div><form class="admin-reply" @submit.prevent="sendReply"><DMInput v-model="ReplyMessage" :placeholder="Text.ReplyPlaceholder"/><DMButton native-type="submit" type="none" :is-tooltip="false" :message="Text.SendReply" class="admin-button"/></form><div class="admin-order-card__actions"><DMButton type="none" :is-tooltip="false" message="Resolve" class="admin-button" @click="resolveTicket" /><DMButton type="none" :is-tooltip="false" message="Close" class="admin-button admin-button--danger" @click="closeTicket" /></div></div>
      <div v-else class="admin-conversation"><p>{{ Text.SelectTicket }}</p></div>
    </article>
  </section>
</template>
<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>
