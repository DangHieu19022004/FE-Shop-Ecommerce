<script setup>
import { inject, nextTick, ref, watch } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import SupportChatData from "@/data/supportChatData.json";
import { ChatMessages, IsAdminTyping, IsChatOpen, UnreadMessageCount, sendChatMessage, toggleChat } from "@/stores/supportChatStore";

defineProps({ IsEmbedded: { type: Boolean, default: false } });
const Text = inject("i18nCommon").SupportChat;
const MessageInput = ref("");
const MessageListRef = ref(null);
const SupportAgent = SupportChatData.SupportAgents[0];

const scrollToLatest = () => nextTick(() => { if (MessageListRef.value) MessageListRef.value.scrollTop = MessageListRef.value.scrollHeight; });
const handleSend = () => { if (sendChatMessage(MessageInput.value, Text.AutoReply)) { MessageInput.value = ""; scrollToLatest(); } };
const handleQuickReply = (QuickReplyText) => { MessageInput.value = QuickReplyText; handleSend(); };
const formatTime = (DateValue) => new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(DateValue));
watch([ChatMessages, IsChatOpen], scrollToLatest, { deep: true });
</script>

<template>
  <div class="support-chat" :class="{ 'support-chat--embedded': IsEmbedded }">
    <button v-if="!IsEmbedded" type="button" class="support-chat__bubble" :aria-label="Text.BubbleLabel" @click="toggleChat">
      <span class="material-symbols-outlined" aria-hidden="true">{{ IsChatOpen ? "close" : "support_agent" }}</span>
      <span v-if="UnreadMessageCount" class="support-chat__badge">{{ UnreadMessageCount }}</span>
    </button>
    <section v-if="IsEmbedded || IsChatOpen" class="support-chat__panel" aria-live="polite">
      <header class="support-chat__header"><span class="support-chat__avatar material-symbols-outlined" aria-hidden="true">support_agent</span><div><strong>{{ SupportAgent.DisplayName }}</strong><span><i></i>{{ Text.Online }} · {{ Text.ResponseTime }}</span></div><DMButton v-if="!IsEmbedded" type="none" :is-tooltip="false" class="support-chat__close" :aria-label="Text.CloseChat" @click="toggleChat"><span class="material-symbols-outlined" aria-hidden="true">close</span></DMButton></header>
      <div ref="MessageListRef" class="support-chat__messages">
        <div v-for="MessageItem in ChatMessages" :key="MessageItem.ChatMessageId" class="support-message" :class="`support-message--${MessageItem.SenderType.toLowerCase()}`"><p>{{ MessageItem.MessageContent }}</p><time>{{ formatTime(MessageItem.SentAt) }}</time></div>
        <div v-if="IsAdminTyping" class="support-message support-message--admin support-message--typing"><span></span><span></span><span></span><small>{{ Text.AdminTyping }}</small></div>
      </div>
      <div class="support-chat__quick-replies"><button v-for="QuickReplyItem in SupportChatData.QuickReplies" :key="QuickReplyItem.QuickReplyId" type="button" @click="handleQuickReply(QuickReplyItem.QuickReplyText)">{{ QuickReplyItem.QuickReplyText }}</button></div>
      <form class="support-chat__composer" @submit.prevent="handleSend"><input v-model="MessageInput" :placeholder="Text.InputPlaceholder" maxlength="500" /><DMButton type="none" :is-tooltip="false" class="support-chat__send" :aria-label="Text.SendMessage" @click="handleSend"><span class="material-symbols-outlined" aria-hidden="true">send</span></DMButton></form>
      <router-link v-if="!IsEmbedded" :to="{ name: 'support' }" class="support-chat__center-link" @click="toggleChat">{{ Text.ViewSupportCenter }}</router-link>
    </section>
  </div>
</template>

<style scoped src="@/assets/styles/screens/support-chat.css"></style>
