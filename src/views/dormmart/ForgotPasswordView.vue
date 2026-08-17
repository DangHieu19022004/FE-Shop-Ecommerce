<script setup>
import { inject, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";

const Text = inject("i18nCommon").ForgotPassword;
const ForgotPasswordForm = reactive({ Email: "" });
const EmailError = ref("");
const SuccessMessage = ref("");

const handleSubmit = () => {
  const EmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  EmailError.value = !ForgotPasswordForm.Email.trim()
    ? Text.RequiredEmail
    : EmailPattern.test(ForgotPasswordForm.Email)
      ? ""
      : Text.InvalidEmail;
  SuccessMessage.value = EmailError.value ? "" : Text.SuccessMessage;
};
</script>

<template>
  <article class="auth-card dm-card">
    <header class="auth-card__header">
      <span class="dm-brand-icon dm-brand-icon--app-icon" aria-hidden="true"></span>
      <h1>{{ Text.Title }}</h1>
      <p>{{ Text.Subtitle }}</p>
    </header>
    <form class="auth-form" novalidate @submit.prevent="handleSubmit">
      <DMInput v-model="ForgotPasswordForm.Email" class="auth-form__input" type="email" :label="Text.EmailLabel" :placeholder="Text.EmailPlaceholder" :error-messages="EmailError" :is-required="true" />
      <p v-if="SuccessMessage" class="auth-form__message auth-form__message--success" role="status">{{ SuccessMessage }}</p>
      <DMButton native-type="submit" type="none" :is-tooltip="false" :message="Text.SubmitButton" class="auth-form__submit" />
    </form>
    <p class="auth-card__switch"><router-link :to="{ name: 'login' }">{{ Text.BackToLogin }}</router-link></p>
  </article>
</template>

<style scoped src="@/assets/styles/screens/auth.css"></style>
