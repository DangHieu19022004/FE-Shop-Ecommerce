<script setup>
import { inject } from "vue";

const Text = inject("i18nCommon").Checkout;
</script>

<template>
  <section class="checkout-state dm-card">
    <span class="material-symbols-outlined" aria-hidden="true">payments</span>
    <h1>{{ Text.Title }}</h1>
    <p>{{ Text.Description }}</p>
    <router-link :to="{ name: 'cart' }" class="dm-btn">{{ Text.BackToCart }}</router-link>
  </section>
</template>

<style scoped>
.checkout-state {
  display: flex;
  min-height: 420px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 14px;
  padding: 32px;
  text-align: center;
}
.checkout-state > .material-symbols-outlined { color: var(--dm-primary); font-size: 64px; }
.checkout-state h1, .checkout-state p { margin: 0; }
.checkout-state p { max-width: 620px; color: var(--dm-text-soft); line-height: 1.7; }
</style>
