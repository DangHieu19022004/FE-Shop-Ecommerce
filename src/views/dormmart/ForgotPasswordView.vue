<script setup>
import { inject, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import { forgotPassword } from "@/services/authService";

const Text = inject("i18nCommon").ForgotPassword;
const ForgotPasswordForm = reactive({ Email: "" });
const EmailError = ref("");
const ErrorMessage = ref("");
const SuccessMessage = ref("");
const IsSubmitting = ref(false);

const handleSubmit = async () => {
  const EmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  EmailError.value = !ForgotPasswordForm.Email.trim()
    ? Text.RequiredEmail
    : EmailPattern.test(ForgotPasswordForm.Email)
      ? ""
      : Text.InvalidEmail;
  ErrorMessage.value = "";
  SuccessMessage.value = "";
  if (EmailError.value) return;

  IsSubmitting.value = true;
  const Result = await forgotPassword(ForgotPasswordForm.Email);
  IsSubmitting.value = false;

  if (!Result.IsSuccess) {
    ErrorMessage.value = Result.Message || Text.InvalidEmail;
    return;
  }

  SuccessMessage.value = Result.Message || Text.SuccessMessage;
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
      <p v-if="ErrorMessage" class="auth-form__message auth-form__message--error" role="alert">{{ ErrorMessage }}</p>
      <p v-if="SuccessMessage" class="auth-form__message auth-form__message--success" role="status">{{ SuccessMessage }}</p>
      <DMButton native-type="submit" type="none" :is-tooltip="false" class="auth-form__submit" icon-name="send" :message="Text.SubmitButton" />
    </form>
    <p class="auth-card__switch"><router-link :to="{ name: 'login' }">{{ Text.BackToLogin }}</router-link></p>
  </article>
</template>

<style scoped src="@/assets/styles/screens/auth.css"></style>
