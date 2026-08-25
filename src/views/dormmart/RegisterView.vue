<script setup>
import { inject, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import DMCheckbox from "@/components/base/DMCheckbox.vue";
import DMInput from "@/components/base/DMInput.vue";
import { registerUser } from "@/services/authService";

const Text = inject("i18nCommon").Register;
const Router = useRouter();
const RegisterForm = reactive({ FullName: "", Email: "", Phone: "", Password: "", ConfirmPassword: "", HasAgreed: false });
const FormErrors = reactive({ FullName: "", Email: "", Phone: "", Password: "", ConfirmPassword: "", Agreement: "", General: "" });
const IsPasswordVisible = ref(false);
const IsSubmitting = ref(false);

const validateForm = () => {
  const EmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PhonePattern = /^(0|\+84)[0-9]{9}$/;
  FormErrors.FullName = RegisterForm.FullName.trim() ? "" : Text.RequiredField;
  FormErrors.Email = !RegisterForm.Email.trim() ? Text.RequiredField : EmailPattern.test(RegisterForm.Email) ? "" : Text.InvalidEmail;
  FormErrors.Phone = !RegisterForm.Phone.trim() ? Text.RequiredField : PhonePattern.test(RegisterForm.Phone) ? "" : Text.InvalidPhone;
  FormErrors.Password = !RegisterForm.Password ? Text.RequiredField : RegisterForm.Password.length >= 8 ? "" : Text.WeakPassword;
  FormErrors.ConfirmPassword = RegisterForm.ConfirmPassword === RegisterForm.Password ? "" : Text.PasswordMismatch;
  FormErrors.Agreement = RegisterForm.HasAgreed ? "" : Text.AgreementRequired;
  FormErrors.General = "";
  return !Object.values(FormErrors).some(Boolean);
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  IsSubmitting.value = true;
  const RegisterResult = await registerUser(RegisterForm);
  IsSubmitting.value = false;
  if (!RegisterResult.IsSuccess) {
    FormErrors.General = Text.AccountExists;
    return;
  }
  Router.push({ name: "login", query: { RegisterMessage: Text.RegisterSuccess } });
};

const togglePassword = () => {
  IsPasswordVisible.value = !IsPasswordVisible.value;
};
</script>

<template>
  <article class="auth-card auth-card--wide dm-card">
    <header class="auth-card__header">
      <span class="dm-brand-icon dm-brand-icon--app-icon" aria-hidden="true"></span>
      <h1>{{ Text.Title }}</h1>
      <p>{{ Text.Subtitle }}</p>
    </header>

    <form class="auth-form" novalidate @submit.prevent="handleSubmit">
      <div class="auth-form__grid">
        <DMInput v-model="RegisterForm.FullName" class="auth-form__input" :label="Text.FullNameLabel" :placeholder="Text.FullNamePlaceholder" :error-messages="FormErrors.FullName" :is-required="true" />
        <DMInput v-model="RegisterForm.Phone" class="auth-form__input" :label="Text.PhoneLabel" :placeholder="Text.PhonePlaceholder" :error-messages="FormErrors.Phone" :is-required="true" />
      </div>
      <DMInput v-model="RegisterForm.Email" class="auth-form__input" type="email" :label="Text.EmailLabel" :placeholder="Text.EmailPlaceholder" :error-messages="FormErrors.Email" :is-required="true" />
      <div class="auth-form__grid">
        <div class="auth-form__password">
          <DMInput v-model="RegisterForm.Password" class="auth-form__input" :type="IsPasswordVisible ? 'text' : 'password'" :label="Text.PasswordLabel" :placeholder="Text.PasswordPlaceholder" :error-messages="FormErrors.Password" :is-required="true" :has-trailing-action="true" />
          <DMButton type="none" :is-tooltip="false" class="auth-form__visibility" :aria-label="IsPasswordVisible ? Text.HidePassword : Text.ShowPassword" @click="togglePassword"><span class="material-symbols-outlined" aria-hidden="true">{{ IsPasswordVisible ? "visibility_off" : "visibility" }}</span></DMButton>
        </div>
        <DMInput v-model="RegisterForm.ConfirmPassword" class="auth-form__input" :type="IsPasswordVisible ? 'text' : 'password'" :label="Text.ConfirmPasswordLabel" :placeholder="Text.ConfirmPasswordPlaceholder" :error-messages="FormErrors.ConfirmPassword" :is-required="true" />
      </div>

      <DMCheckbox v-model="RegisterForm.HasAgreed">
        {{ Text.AgreementPrefix }} <strong>{{ Text.TermsLink }}</strong>
      </DMCheckbox>
      <p v-if="FormErrors.Agreement" class="auth-form__message auth-form__message--error">{{ FormErrors.Agreement }}</p>
      <p v-if="FormErrors.General" class="auth-form__message auth-form__message--error" role="alert">{{ FormErrors.General }}</p>
      <DMButton native-type="submit" type="none" :is-tooltip="false" :message="Text.SubmitButton" class="auth-form__submit" :un-active="IsSubmitting" />
    </form>

    <div class="auth-divider"><span>{{ Text.Divider }}</span></div>
    <DMButton type="none" :is-tooltip="false" :message="Text.GoogleButton" class="auth-form__google" />
    <p class="auth-card__switch">{{ Text.HasAccount }} <router-link :to="{ name: 'login' }">{{ Text.LoginLink }}</router-link></p>
  </article>
</template>

<style scoped src="@/assets/styles/screens/auth.css"></style>
