<template>
  <div class="dm-page">
    <header class="dm-public-header">
      <div class="dm-public-header__top">
        <div class="dm-public-header__links">
          <router-link to="/admin">Admin</router-link>
          <router-link to="/products">Catalog</router-link>
          <span>Student deals daily</span>
        </div>
        <div class="dm-public-header__links">
          <router-link to="/login">Đăng nhập</router-link>
          <router-link to="/register">Đăng ký</router-link>
        </div>
      </div>

      <div class="dm-public-header__main">
        <router-link to="/" class="dm-brand" aria-label="Dorm Mart - Trang chủ">
          <span class="dm-brand-icon dm-brand-icon--horizontal-logo" aria-hidden="true"></span>
        </router-link>

        <label class="dm-search">
          <span class="material-symbols-outlined">search</span>
          <input :value="searchValue" type="text" placeholder="Search dorm essentials, snacks, and tech" readonly />
          <button type="button" class="dm-btn">Search</button>
        </label>

        <div class="dm-public-actions">
          <router-link class="dm-icon-btn" to="/cart" aria-label="Cart">
            <span class="material-symbols-outlined">shopping_cart</span>
            <span class="dm-badge-dot">3</span>
          </router-link>
          <router-link class="dm-icon-btn" to="/profile" aria-label="Account">
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
            <h4>Dorm Mart</h4>
            <p>TapHoaSinhVien - nơi gom đủ đồ cho sinh viên, ký túc xá, ở trọ.</p>
          </div>
          <div class="dm-footer__column">
            <h4>Customer Service</h4>
            <a href="#">Help Centre</a>
            <a href="#">Dorm Mart Blog</a>
            <a href="#">Return & Refund</a>
          </div>
          <div class="dm-footer__column">
            <h4>About</h4>
            <a href="#">Our Story</a>
            <a href="#">Student Seller</a>
            <a href="#">Careers</a>
          </div>
          <div class="dm-footer__column">
            <h4>Payment</h4>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>COD</span>
          </div>
        </div>

        <div class="dm-footer__bottom">
          <span>© 2024 Dorm Mart. All Rights Reserved.</span>
          <span>Vietnam | Thailand | Singapore | Philippines</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
defineProps({
  searchValue: {
    type: String,
    default: "",
  },
});
</script>
