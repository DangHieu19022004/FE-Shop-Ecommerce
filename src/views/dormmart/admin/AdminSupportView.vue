<script setup>
import { computed, inject, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import AdminData from "@/data/adminData.json";

const Text = inject("i18nCommon").AdminSupport;
const Tickets = ref(structuredClone(AdminData.SupportTickets));
const SelectedTicketId = ref(Tickets.value[0]?.TicketId || "");
const ReplyMessage = ref("");
const SelectedTicket = computed(() => Tickets.value.find((Item) => Item.TicketId === SelectedTicketId.value));
const sendReply = () => {
  const Message = ReplyMessage.value.trim();
  if (!Message || !SelectedTicket.value) return;
  SelectedTicket.value.Replies.push({ SenderType: "ADMIN", Message, CreatedAt: new Date().toLocaleString("vi-VN") });
  SelectedTicket.value.StatusCode = "IN_PROGRESS";
  ReplyMessage.value = "";
};
</script>
<template>
  <section class="admin-page">
    <header class="admin-page__header"><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div></header>
    <article class="dm-card admin-support">
      <div class="admin-ticket-list"><button v-for="TicketItem in Tickets" :key="TicketItem.TicketId" type="button" :class="['admin-ticket', { 'admin-ticket--active': TicketItem.TicketId === SelectedTicketId }]" @click="SelectedTicketId = TicketItem.TicketId"><strong>{{ TicketItem.Subject }}</strong><span>{{ TicketItem.CustomerName }} · {{ TicketItem.TicketId }}</span><small>{{ TicketItem.LastMessage }}</small></button></div>
      <div v-if="SelectedTicket" class="admin-conversation"><div class="admin-panel__header"><div><h2>{{ Text.Conversation }}</h2><p>{{ SelectedTicket.CustomerName }} · {{ SelectedTicket.CreatedAt }}</p></div><span class="admin-status admin-status--warning">{{ SelectedTicket.StatusCode }}</span></div><div class="admin-message">{{ SelectedTicket.LastMessage }}</div><div v-for="ReplyItem in SelectedTicket.Replies" :key="`${ReplyItem.CreatedAt}-${ReplyItem.Message}`" class="admin-message admin-message--admin">{{ ReplyItem.Message }}</div><form class="admin-reply" @submit.prevent="sendReply"><DMInput v-model="ReplyMessage" :placeholder="Text.ReplyPlaceholder"/><DMButton native-type="submit" type="none" :is-tooltip="false" :message="Text.SendReply" class="admin-button"/></form></div>
      <div v-else class="admin-conversation"><p>{{ Text.SelectTicket }}</p></div>
    </article>
  </section>
</template>
<style scoped src="@/assets/styles/screens/admin-operations.css"></style>
