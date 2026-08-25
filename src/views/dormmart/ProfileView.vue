<script setup>
import { computed, inject } from "vue";
import { useRouter } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import { getCurrentSession, logoutUser } from "@/services/authService";

const Text = inject("i18nCommon").Profile;
const Router = useRouter();
const SessionData = getCurrentSession();
const DisplayName = computed(() => SessionData?.FullName || Text.EmptyValue);
const AvatarLetter = computed(() => DisplayName.value.charAt(0).toUpperCase());

const handleLogout = () => {
  logoutUser();
  Router.replace({ name: "login" });
};
</script>

<template>
  <section class="profile-page">
    <header class="profile-page__header">
      <div>
        <p class="profile-page__eyebrow">Dorm Mart</p>
        <h1>{{ Text.PageTitle }}</h1>
        <p>{{ Text.PageSubtitle }}</p>
      </div>
      <DMButton type="none" :is-tooltip="false" class="profile-page__logout" @click="handleLogout">
        <span class="material-symbols-outlined" aria-hidden="true">logout</span>
        {{ Text.LogoutButton }}
      </DMButton>
    </header>

    <div class="profile-page__grid">
      <article class="profile-summary dm-card">
        <div class="profile-summary__avatar" aria-hidden="true">{{ AvatarLetter }}</div>
        <div>
          <h2>{{ DisplayName }}</h2>
          <p>{{ SessionData?.Email || Text.EmptyValue }}</p>
        </div>
      </article>

      <article class="profile-details dm-card">
        <h2>{{ Text.AccountSectionTitle }}</h2>
        <dl class="profile-details__list">
          <div>
            <dt>{{ Text.FullNameLabel }}</dt>
            <dd>{{ DisplayName }}</dd>
          </div>
          <div>
            <dt>{{ Text.EmailLabel }}</dt>
            <dd>{{ SessionData?.Email || Text.EmptyValue }}</dd>
          </div>
          <div>
            <dt>{{ Text.PhoneLabel }}</dt>
            <dd>{{ SessionData?.Phone || Text.EmptyValue }}</dd>
          </div>
        </dl>
      </article>

      <aside class="profile-coming-soon dm-card">
        <span class="material-symbols-outlined" aria-hidden="true">construction</span>
        <div>
          <h2>{{ Text.ComingSoonTitle }}</h2>
          <p>{{ Text.ComingSoonDescription }}</p>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped src="@/assets/styles/screens/profile.css"></style>
