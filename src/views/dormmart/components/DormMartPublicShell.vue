<template>
  <div class="dm-page">
    <header class="dm-public-header">
      <div class="dm-public-header__top">
        <div class="dm-public-header__links">
          <router-link to="/admin">{{ Text.AdminLink }}</router-link>
          <router-link to="/products">{{ Text.CatalogLink }}</router-link>
          <span>{{ Text.PromotionMessage }}</span>
        </div>
        <div class="dm-public-header__links">
          <router-link :to="{ name: 'orderHistory' }">{{ Text.OrderHistoryLink }}</router-link>
          <router-link :to="{ name: 'support' }">{{ Text.SupportLink }}</router-link>
          <router-link to="/login">{{ Text.LoginLink }}</router-link>
          <router-link to="/register">{{ Text.RegisterLink }}</router-link>
        </div>
      </div>

      <div class="dm-public-header__main">
        <router-link to="/" class="dm-brand" :aria-label="Text.HomeAriaLabel">
          <span class="dm-brand-icon dm-brand-icon--horizontal-logo" aria-hidden="true"></span>
        </router-link>

        <label class="dm-search">
          <span class="material-symbols-outlined">search</span>
          <input :value="searchValue" type="text" :placeholder="Text.SearchPlaceholder" readonly />
          <button type="button" class="dm-btn dm-icon-btn" :aria-label="Text.SearchButton" :title="Text.SearchButton"><span class="material-symbols-outlined" aria-hidden="true">search</span></button>
        </label>

        <div class="dm-public-actions">
          <router-link class="dm-icon-btn dm-cart-button" to="/cart" :aria-label="Text.CartLabel">
            <span class="material-symbols-outlined">shopping_cart</span>
            <span v-if="CartTotalQuantity" class="dm-badge-dot">{{ CartTotalQuantity }}</span>
          </router-link>
          <router-link class="dm-icon-btn" to="/profile" :aria-label="Text.AccountLabel">
            <span class="material-symbols-outlined">person</span>
          </router-link>
        </div>
      </div>
    </header>

    <main class="dm-public-main">
      <div class="dm-container">
        <slot />
      </div>
    </main>

    <footer class="dm-footer">
      <div class="dm-footer__inner">
        <div class="dm-footer__grid">
          <div class="dm-footer__column">
            <h4>{{ Text.BrandName }}</h4>
            <p>{{ Text.BrandDescription }}</p>
          </div>
          <div class="dm-footer__column">
            <h4>{{ Text.CustomerServiceTitle }}</h4>
            <a href="#">{{ Text.HelpCenter }}</a>
            <a href="#">{{ Text.Blog }}</a>
            <a href="#">{{ Text.ReturnRefund }}</a>
          </div>
          <div class="dm-footer__column">
            <h4>{{ Text.AboutTitle }}</h4>
            <a href="#">{{ Text.OurStory }}</a>
            <a href="#">{{ Text.StudentSeller }}</a>
            <a href="#">{{ Text.Careers }}</a>
          </div>
          <div class="dm-footer__column">
            <h4>{{ Text.PaymentTitle }}</h4>
            <span>{{ Text.Visa }}</span>
            <span>{{ Text.Mastercard }}</span>
            <span>{{ Text.CashOnDelivery }}</span>
          </div>
        </div>

        <div class="dm-footer__bottom">
          <span>{{ Text.Copyright }}</span>
          <span>{{ Text.Regions }}</span>
        </div>
      </div>
    </footer>
    <SupportChatWidget />
  </div>
</template>

<script setup>
import { inject } from "vue";
import { CartTotalQuantity } from "@/stores/cartStore";
import SupportChatWidget from "@/components/dormmart/SupportChatWidget.vue";

const Text = inject("i18nCommon").Common;

defineProps({
  searchValue: {
    type: String,
    default: "",
  },
});
</script>
