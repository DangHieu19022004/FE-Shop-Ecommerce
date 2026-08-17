<script setup>
import { inject } from "vue";
import SupportChatWidget from "@/components/dormmart/SupportChatWidget.vue";
import SupportChatData from "@/data/supportChatData.json";

const Text = inject("i18nCommon").SupportPage;
</script>

<template>
  <section class="support-page">
    <header class="support-page__hero dm-card"><span class="material-symbols-outlined" aria-hidden="true">contact_support</span><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div></header>
    <div class="support-page__layout">
      <div class="support-page__content">
        <article class="support-topics dm-card"><h2>{{ Text.TopicTitle }}</h2><div class="support-topics__grid"><button v-for="TopicItem in SupportChatData.SupportTopics" :key="TopicItem.SupportTopicId" type="button"><span class="material-symbols-outlined" aria-hidden="true">{{ TopicItem.IconName }}</span><strong>{{ TopicItem.TopicName }}</strong><small>{{ TopicItem.TopicDescription }}</small></button></div></article>
        <article class="support-contact dm-card"><h2>{{ Text.ContactTitle }}</h2><div><span class="material-symbols-outlined" aria-hidden="true">call</span><p><strong>{{ Text.HotlineLabel }}</strong><a :href="`tel:${Text.HotlineValue.replaceAll(' ', '')}`">{{ Text.HotlineValue }}</a></p></div><div><span class="material-symbols-outlined" aria-hidden="true">mail</span><p><strong>{{ Text.EmailLabel }}</strong><a :href="`mailto:${Text.EmailValue}`">{{ Text.EmailValue }}</a></p></div><div><span class="material-symbols-outlined" aria-hidden="true">schedule</span><p><strong>{{ Text.WorkingTimeLabel }}</strong><span>{{ Text.WorkingTimeValue }}</span></p></div></article>
      </div>
      <aside class="support-page__chat"><div><h2>{{ Text.ChatTitle }}</h2><p>{{ Text.ChatDescription }}</p></div><SupportChatWidget :IsEmbedded="true" /></aside>
    </div>
  </section>
</template>

<style scoped src="@/assets/styles/screens/support-page.css"></style>
