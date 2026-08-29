<script setup>
import { inject, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import DMCheckbox from "@/components/base/DMCheckbox.vue";
import DMInput from "@/components/base/DMInput.vue";
import { loginUser, loginWithGoogle } from "@/services/authService";
import { hasGoogleLoginConfig, signInWithGoogle } from "@/services/socialAuthService";

const Text = inject("i18nCommon").Login;
const Route = useRoute();
const Router = useRouter();
const LoginForm = reactive({ Account: "", Password: "", RememberMe: true });
const FormErrors = reactive({ Account: "", Password: "", General: "", Facebook: "", Google: "" });
const IsPasswordVisible = ref(false);
const IsSubmitting = ref(false);
const IsGoogleSubmitting = ref(false);
const HasGoogleLoginConfig = hasGoogleLoginConfig();

const redirectAfterLogin = () => {
  const RedirectPath = typeof Route.query.Redirect === "string" ? Route.query.Redirect : "/";
  Router.push({ path: RedirectPath, query: { AuthMessage: Text.LoginSuccess } });
};

const mapSocialAuthError = (Error, FallbackMessage) => Error?.message || FallbackMessage;

const validateForm = () => {
  FormErrors.Account = LoginForm.Account.trim() ? "" : Text.AccountRequired;
  FormErrors.Password = LoginForm.Password ? "" : Text.PasswordRequired;
  FormErrors.General = "";
  return !FormErrors.Account && !FormErrors.Password;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  IsSubmitting.value = true;
  const LoginResult = await loginUser(LoginForm);
  IsSubmitting.value = false;

  if (!LoginResult.IsSuccess) {
    FormErrors.General = LoginResult.ErrorCode === "INVALID_CREDENTIALS"
      ? Text.InvalidCredentials
      : LoginResult.Message || Text.InvalidCredentials;
    return;
  }

  redirectAfterLogin();
};

const handleGoogleLogin = async () => {
  FormErrors.Google = "";
  FormErrors.General = "";
  if (!HasGoogleLoginConfig) {
    FormErrors.Google = Text.GoogleUnavailable;
    return;
  }

  IsGoogleSubmitting.value = true;

  try {
    const IdToken = await signInWithGoogle();
    const LoginResult = await loginWithGoogle(IdToken, LoginForm.RememberMe);

    if (!LoginResult.IsSuccess) {
      FormErrors.Google = LoginResult.Message || Text.GoogleFailed;
      return;
    }

    redirectAfterLogin();
  } catch (Error) {
    FormErrors.Google = mapSocialAuthError(Error, Text.GoogleFailed);
  } finally {
    IsGoogleSubmitting.value = false;
  }
};

const togglePassword = () => {
  IsPasswordVisible.value = !IsPasswordVisible.value;
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
      <DMInput v-model="LoginForm.Account" class="auth-form__input" :label="Text.AccountLabel" :placeholder="Text.AccountPlaceholder" :error-messages="FormErrors.Account" :is-required="true" />
      <div class="auth-form__password">
        <DMInput v-model="LoginForm.Password" class="auth-form__input" :type="IsPasswordVisible ? 'text' : 'password'" :label="Text.PasswordLabel" :placeholder="Text.PasswordPlaceholder" :error-messages="FormErrors.Password" :is-required="true" :has-trailing-action="true" />
        <DMButton type="none" :is-tooltip="false" class="auth-form__visibility" :aria-label="IsPasswordVisible ? Text.HidePassword : Text.ShowPassword" @click="togglePassword">
          <span class="material-symbols-outlined" aria-hidden="true">{{ IsPasswordVisible ? "visibility_off" : "visibility" }}</span>
        </DMButton>
      </div>

      <p v-if="FormErrors.General" class="auth-form__message auth-form__message--error" role="alert">{{ FormErrors.General }}</p>

      <div class="auth-form__options">
        <DMCheckbox v-model="LoginForm.RememberMe" :label="Text.RememberMe" />
        <router-link :to="{ name: 'forgotPassword' }">{{ Text.ForgotPassword }}</router-link>
      </div>

      <DMButton native-type="submit" type="none" :is-tooltip="false" class="auth-form__submit" :un-active="IsSubmitting" :aria-label="Text.SubmitButton" :title="Text.SubmitButton"><span class="material-symbols-outlined" aria-hidden="true">login</span></DMButton>
    </form>

    <div class="auth-divider"><span>{{ Text.Divider }}</span></div>
    <div class="auth-social-actions">
      <DMButton type="none" :is-tooltip="false" class="auth-form__social auth-form__google" :un-active="IsGoogleSubmitting" :aria-label="Text.GoogleButton" :title="Text.GoogleButton" @click="handleGoogleLogin">
        <span class="auth-form__social-label">{{ IsGoogleSubmitting ? Text.GoogleLoading : Text.GoogleButton }}</span>
      </DMButton>
      <p v-if="FormErrors.Google" class="auth-form__message auth-form__message--error" role="alert">{{ FormErrors.Google }}</p>

    </div>

    <p class="auth-card__switch">
      {{ Text.NoAccount }}
      <router-link :to="{ name: 'register' }">{{ Text.RegisterLink }}</router-link>
    </p>
  </article>
</template>

<style scoped src="@/assets/styles/screens/auth.css"></style>
