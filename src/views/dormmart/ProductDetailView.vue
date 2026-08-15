<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { products } from "@/views/dormmart/mock/catalog";

const route = useRoute();
const quantity = ref(1);

const product = computed(() => products.find((item) => item.slug === route.params.slug) ?? products[0]);
const relatedProducts = computed(() => products.filter((item) => item.slug !== product.value.slug).slice(0, 3));

watch(
  () => route.params.slug,
  () => {
    quantity.value = 1;
  }
);

const changeQty = (delta) => {
  quantity.value = Math.min(product.value.stock, Math.max(1, quantity.value + delta));
};
</script>

<template>
  <section style="display: flex; flex-direction: column; gap: 24px;">
    <div style="display: flex; align-items: center; gap: 8px; color: var(--dm-text-soft); font-size: 13px;">
      <router-link to="/">Home</router-link>
      <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
      <router-link to="/products">{{ product.category }}</router-link>
      <span class="material-symbols-outlined" style="font-size: 14px;">chevron_right</span>
      <strong style="color: var(--dm-primary);">{{ product.title }}</strong>
    </div>

    <div class="dm-card" style="padding: 24px; display: grid; grid-template-columns: minmax(320px, 480px) minmax(0, 1fr); gap: 28px; align-items: start;">
      <div>
        <img :src="product.image" :alt="product.title" style="width: 100%; aspect-ratio: 1 / 1; object-fit: cover; border-radius: 20px; background: var(--dm-surface-soft);" />
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 12px;">
          <img v-for="thumb in product.thumbs" :key="thumb" :src="thumb" :alt="product.title" style="width: 100%; aspect-ratio: 1 / 1; object-fit: cover; border-radius: 12px; border: 2px solid var(--dm-border);" />
          <div class="dm-card" style="display: grid; place-items: center; aspect-ratio: 1 / 1; color: var(--dm-primary); font-weight: 700;">Video</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 20px; min-width: 0;">
        <div>
          <h1 style="font-size: clamp(28px, 4vw, 42px); line-height: 1.1; margin-bottom: 12px;">{{ product.title }}</h1>
          <div style="display: flex; flex-wrap: wrap; gap: 16px; color: var(--dm-text-soft); border-bottom: 1px solid var(--dm-border); padding-bottom: 16px;">
            <span>{{ product.rating }}</span>
            <span>{{ product.sold }}</span>
            <span style="color: var(--dm-success);">Authentic Brand</span>
          </div>
        </div>

        <div class="dm-card" style="padding: 18px; background: linear-gradient(180deg, #fff, #f8f9fa); box-shadow: none;">
          <div style="display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;">
            <span style="font-size: 30px; font-weight: 800; color: var(--dm-danger);">{{ product.price }}</span>
            <span style="color: var(--dm-text-soft); text-decoration: line-through;">{{ product.oldPrice }}</span>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
            <span class="dm-pill" style="background: var(--dm-primary-soft); color: var(--dm-primary);">Flash Deal Ends in 04:21:13</span>
            <span class="dm-pill" style="background: rgba(0, 191, 165, 0.1); color: var(--dm-success);">Free Shipping Extra</span>
          </div>
        </div>

        <div style="display: grid; gap: 16px;">
          <div style="display: grid; grid-template-columns: 100px minmax(0, 1fr); gap: 12px; align-items: center;">
            <span style="color: var(--dm-text-soft); text-transform: uppercase; font-size: 12px; font-weight: 700;">Color</span>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button type="button" class="dm-btn-ghost">Arctic White</button>
              <button type="button" class="dm-btn-ghost">Space Gray</button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 100px minmax(0, 1fr); gap: 12px; align-items: center;">
            <span style="color: var(--dm-text-soft); text-transform: uppercase; font-size: 12px; font-weight: 700;">Quantity</span>
            <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
              <div class="dm-card" style="display: inline-flex; align-items: center; box-shadow: none;">
                <button type="button" class="dm-btn-ghost" style="border: 0; border-right: 1px solid var(--dm-border); border-radius: 12px 0 0 12px;" @click="changeQty(-1)">-</button>
                <div style="min-width: 48px; text-align: center; font-weight: 600;">{{ quantity }}</div>
                <button type="button" class="dm-btn-ghost" style="border: 0; border-left: 1px solid var(--dm-border); border-radius: 0 12px 12px 0;" @click="changeQty(1)">+</button>
              </div>
              <span style="color: var(--dm-text-soft);">{{ product.stock }} pieces available</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <router-link to="/cart" class="dm-btn-ghost" style="flex: 1; text-align: center; padding-top: 14px; padding-bottom: 14px;">Add to Cart</router-link>
          <button type="button" class="dm-btn" style="flex: 1;">Buy Now</button>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 20px; align-items: start;">
      <article class="dm-card" style="padding: 24px; display: grid; gap: 24px;">
        <div>
          <h2 style="font-size: 24px; margin-bottom: 14px;">Product Description</h2>
          <p style="line-height: 1.7; color: var(--dm-text-soft);">{{ product.description }}</p>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 16px;">
            <h2 style="font-size: 24px;">Related Items</h2>
            <router-link to="/products" style="color: var(--dm-primary); font-weight: 700;">Back to catalog</router-link>
          </div>
          <div class="dm-grid dm-grid--products">
            <router-link v-for="item in relatedProducts" :key="item.slug" :to="`/products/${item.slug}`" class="dm-card dm-product-card" style="display: block; color: inherit;">
              <img :src="item.image" :alt="item.title" class="dm-product-card__image" />
              <div class="dm-product-card__body">
                <div class="dm-pill" style="align-self: flex-start; background: var(--dm-primary-soft); color: var(--dm-primary);">{{ item.badge }}</div>
                <strong style="line-height: 1.4;">{{ item.title }}</strong>
                <div style="display: flex; justify-content: space-between; gap: 10px; align-items: baseline;">
                  <span style="color: var(--dm-danger); font-size: 18px; font-weight: 800;">{{ item.price }}</span>
                  <span style="color: var(--dm-text-soft); font-size: 12px;">{{ item.sold }}</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </article>

      <aside class="dm-card" style="padding: 24px;">
        <h3 style="font-size: 20px; margin-bottom: 14px;">Protection & Guarantees</h3>
        <div style="display: grid; gap: 12px; color: var(--dm-text-soft);">
          <div><strong style="color: var(--dm-text);">12 Months Warranty</strong><br />Official manufacturer warranty</div>
          <div><strong style="color: var(--dm-text);">7 Days Return</strong><br />Change of mind is not applicable</div>
          <div><strong style="color: var(--dm-text);">Dorm Mart Guarantee</strong><br />Get item you ordered or refund</div>
        </div>
      </aside>
    </div>
  </section>
</template>
