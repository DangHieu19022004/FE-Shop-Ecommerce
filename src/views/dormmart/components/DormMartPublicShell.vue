<template>
  <div class="dm-page">
    <header class="dm-public-header">
      <div class="dm-public-header__top">
        <div class="dm-public-header__links">
          <router-link v-if="IsAdmin" to="/admin">Admin</router-link>
          <router-link to="/">Trang chủ</router-link>
          <router-link to="/products">Danh sách sản phẩm</router-link>
          <router-link :to="{ name: 'comboList' }">{{ Text.ComboLink }}</router-link>
          <router-link to="/about">Về chúng tôi</router-link>
        </div>
        <div class="dm-public-header__links">
          <router-link :to="{ name: 'orderHistory' }">{{ Text.OrderHistoryLink }}</router-link>
          <router-link :to="{ name: 'support' }">{{ Text.SupportLink }}</router-link>
          <router-link v-if="!SessionData" to="/login">Đăng nhập</router-link>
          <router-link v-if="!SessionData" to="/register">Đăng ký</router-link>
          <router-link v-else to="/profile">{{ SessionData.FullName }}</router-link>
        </div>
      </div>

      <div class="dm-public-header__main">
        <router-link to="/" class="dm-brand" :aria-label="Text.HomeAriaLabel">
          <span class="dm-brand__lockup" aria-hidden="true">
            <span class="dm-brand-icon dm-brand-icon--horizontal-logo"></span>
            <span class="dm-brand__tagline">{{ Text.BrandTagline }}</span>
          </span>
        </router-link>

        <div
          class="dm-search"
          role="button"
          tabindex="0"
          :aria-label="`${Text.SearchButton} - tính năng đang phát triển`"
          :title="`${Text.SearchButton} - tính năng đang phát triển`"
          @click="openSearchPlaceholder"
          @keydown.enter.prevent="openSearchPlaceholder"
          @keydown.space.prevent="openSearchPlaceholder"
        >
          <span class="material-symbols-outlined">search</span>
          <input :value="searchValue" type="text" :placeholder="`${Text.SearchPlaceholder} · Tính năng đang phát triển`" readonly />
          <span class="dm-btn dm-icon-btn"><span class="material-symbols-outlined" aria-hidden="true">search</span></span>
        </div>

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
import { computed, inject } from "vue";
import { useRouter } from "vue-router";
import { CartTotalQuantity } from "@/stores/cartStore";
import SupportChatWidget from "@/components/dormmart/SupportChatWidget.vue";
import { getCurrentSession } from "@/services/authService";

const Router = useRouter();
const Text = inject("i18nCommon").Common;
const SessionData = computed(() => getCurrentSession());
const IsAdmin = computed(() => SessionData.value?.Roles?.includes("Admin"));
const openSearchPlaceholder = () => {
  Router.push({
    name: "featureUnavailable",
    query: {
      title: "Tìm kiếm đang phát triển",
      description: "Tìm kiếm nhanh trong header chưa hoàn thiện. Tạm thời dùng danh sách sản phẩm để lọc và duyệt hàng.",
    },
  });
};

defineProps({
  searchValue: {
    type: String,
    default: "",
  },
});
</script>
