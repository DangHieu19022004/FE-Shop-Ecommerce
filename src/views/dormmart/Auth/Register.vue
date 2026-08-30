<script setup>
import { inject, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import DMCheckbox from "@/components/base/DMCheckbox.vue";
import DMInput from "@/components/base/DMInput.vue";
import { loginWithGoogle, registerUser } from "@/services/authService";
import { hasGoogleLoginConfig, signInWithGoogle } from "@/services/socialAuthService";

const Text = inject("i18nCommon").Register;
const Router = useRouter();
const RegisterForm = reactive({ FullName: "", Email: "", Phone: "", Password: "", ConfirmPassword: "", HasAgreed: false });
const FormErrors = reactive({ FullName: "", Email: "", Phone: "", Password: "", ConfirmPassword: "", Agreement: "", General: "", Google: "", Facebook: "" });
const IsPasswordVisible = ref(false);
const IsSubmitting = ref(false);
const IsGoogleSubmitting = ref(false);
const HasGoogleLoginConfig = hasGoogleLoginConfig();
const EmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PhonePattern = /^(0|\+84)[0-9]{9}$/;

const redirectAfterSocialLogin = () => {
  Router.push({ path: "/", query: { AuthMessage: Text.SocialLoginSuccess } });
};

const mapSocialAuthError = (Error, FallbackMessage) => Error?.message || FallbackMessage;

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
    const LoginResult = await loginWithGoogle(IdToken, false);

    if (!LoginResult.IsSuccess) {
      FormErrors.Google = LoginResult.Message || Text.GoogleFailed;
      return;
    }

    redirectAfterSocialLogin();
  } catch (Error) {
    FormErrors.Google = mapSocialAuthError(Error, Text.GoogleFailed);
  } finally {
    IsGoogleSubmitting.value = false;
  }
};

const validateFullName = () => {
  FormErrors.FullName = RegisterForm.FullName.trim() ? "" : Text.RequiredField;
  return !FormErrors.FullName;
};

const validateEmail = () => {
  FormErrors.Email = !RegisterForm.Email.trim() ? Text.RequiredField : EmailPattern.test(RegisterForm.Email) ? "" : Text.InvalidEmail;
  return !FormErrors.Email;
};

const validatePhone = () => {
  FormErrors.Phone = !RegisterForm.Phone.trim() ? Text.RequiredField : PhonePattern.test(RegisterForm.Phone) ? "" : Text.InvalidPhone;
  return !FormErrors.Phone;
};

const validatePassword = () => {
  FormErrors.Password = !RegisterForm.Password ? Text.RequiredField : RegisterForm.Password.length >= 8 ? "" : Text.WeakPassword;
  if (RegisterForm.ConfirmPassword) validateConfirmPassword();
  return !FormErrors.Password;
};

const validateConfirmPassword = () => {
  FormErrors.ConfirmPassword = RegisterForm.ConfirmPassword === RegisterForm.Password ? "" : Text.PasswordMismatch;
  return !FormErrors.ConfirmPassword;
};

const validateAgreement = (HasAgreed = RegisterForm.HasAgreed) => {
  FormErrors.Agreement = HasAgreed ? "" : Text.AgreementRequired;
  return !FormErrors.Agreement;
};

const validateForm = () => {
  validateFullName();
  validateEmail();
  validatePhone();
  validatePassword();
  validateConfirmPassword();
  validateAgreement();
  FormErrors.General = "";
  return !Object.values(FormErrors).some(Boolean);
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  IsSubmitting.value = true;
  const RegisterResult = await registerUser(RegisterForm);
  IsSubmitting.value = false;
  if (!RegisterResult.IsSuccess) {
    FormErrors.General = RegisterResult.ErrorCode === "ACCOUNT_EXISTS"
      ? Text.AccountExists
      : RegisterResult.Message || Text.RequiredField;
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
        <DMInput v-model="RegisterForm.FullName" id="register-full-name" name="name" autocomplete="name" autocapitalize="words" class="auth-form__input" :label="Text.FullNameLabel" :placeholder="Text.FullNamePlaceholder" :error-messages="FormErrors.FullName" :is-required="true" @blur="validateFullName" />
        <DMInput v-model="RegisterForm.Phone" id="register-phone" name="tel" autocomplete="tel" inputmode="tel" autocapitalize="none" class="auth-form__input" :label="Text.PhoneLabel" :placeholder="Text.PhonePlaceholder" :error-messages="FormErrors.Phone" :is-required="true" @blur="validatePhone" />
      </div>
      <DMInput v-model="RegisterForm.Email" id="register-email" name="email" autocomplete="email" inputmode="email" autocapitalize="none" class="auth-form__input" type="email" :label="Text.EmailLabel" :placeholder="Text.EmailPlaceholder" :error-messages="FormErrors.Email" :is-required="true" @blur="validateEmail" />
      <div class="auth-form__grid">
        <div class="auth-form__password">
          <DMInput v-model="RegisterForm.Password" id="register-password" name="new-password" autocomplete="new-password" autocapitalize="none" class="auth-form__input" :type="IsPasswordVisible ? 'text' : 'password'" :label="Text.PasswordLabel" :placeholder="Text.PasswordPlaceholder" :error-messages="FormErrors.Password" :is-required="true" :has-trailing-action="true" @blur="validatePassword" />
          <DMButton type="none" :is-tooltip="false" class="auth-form__visibility" :icon-name="IsPasswordVisible ? 'visibility_off' : 'visibility'" :aria-label="IsPasswordVisible ? Text.HidePassword : Text.ShowPassword" @click="togglePassword" />
        </div>
        <DMInput v-model="RegisterForm.ConfirmPassword" id="register-confirm-password" name="new-password-confirmation" autocomplete="new-password" autocapitalize="none" class="auth-form__input" :type="IsPasswordVisible ? 'text' : 'password'" :label="Text.ConfirmPasswordLabel" :placeholder="Text.ConfirmPasswordPlaceholder" :error-messages="FormErrors.ConfirmPassword" :is-required="true" @blur="validateConfirmPassword" />
      </div>

      <DMCheckbox v-model="RegisterForm.HasAgreed" @update:model-value="validateAgreement">
        {{ Text.AgreementPrefix }} <strong>{{ Text.TermsLink }}</strong>
      </DMCheckbox>
      <p v-if="FormErrors.Agreement" class="auth-form__message auth-form__message--error">{{ FormErrors.Agreement }}</p>
      <p v-if="FormErrors.General" class="auth-form__message auth-form__message--error" role="alert">{{ FormErrors.General }}</p>
      <DMButton native-type="submit" type="none" :is-tooltip="false" class="auth-form__submit" icon-name="person_add" :message="Text.SubmitButton" :un-active="IsSubmitting" />
    </form>

    <div class="auth-divider"><span>{{ Text.Divider }}</span></div>
    <div class="auth-social-actions">
      <DMButton type="none" :is-tooltip="false" class="auth-form__social auth-form__google" :un-active="IsGoogleSubmitting" :aria-label="Text.GoogleButton" :title="Text.GoogleButton" @click="handleGoogleLogin">
        <span class="auth-form__social-content"><span class="dm-brand-icon dm-brand-icon--google" aria-hidden="true"></span><span class="auth-form__social-label">{{ IsGoogleSubmitting ? Text.GoogleLoading : Text.GoogleButton }}</span></span>
      </DMButton>
      <p v-if="FormErrors.Google" class="auth-form__message auth-form__message--error" role="alert">{{ FormErrors.Google }}</p>

    </div>
    <p class="auth-card__switch">{{ Text.HasAccount }} <router-link :to="{ name: 'login' }">{{ Text.LoginLink }}</router-link></p>
  </article>
</template>

<style scoped lang="scss" src="@/assets/styles/screens/auth.scss"></style>
