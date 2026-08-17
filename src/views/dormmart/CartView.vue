<script setup>
const cartItems = [
  {
    name: "Mini Washing Machine X-1",
    variant: "Arctic White",
    price: "đ 1,250,000",
    qty: 1,
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "LumiDesk LED Smart Lamp",
    variant: "Wireless Charging",
    price: "$34.50",
    qty: 2,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
  },
];
</script>

<template>
  <section style="display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 20px; align-items: start;">
    <article class="dm-card" style="padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px;">
        <div>
          <h1 style="font-size: 32px; margin-bottom: 6px;">Your Cart</h1>
          <p style="color: var(--dm-text-soft);">{{ cartItems.length }} items selected for checkout</p>
        </div>
        <router-link to="/products" class="dm-btn-ghost">Continue shopping</router-link>
      </div>

      <div style="display: grid; gap: 14px;">
        <div v-for="item in cartItems" :key="item.name" class="dm-card" style="padding: 14px; box-shadow: none; display: grid; grid-template-columns: 110px minmax(0, 1fr) auto; gap: 14px; align-items: center;">
          <img :src="item.image" :alt="item.name" style="width: 100%; aspect-ratio: 1 / 1; border-radius: 12px; object-fit: cover;" />
          <div style="min-width: 0;">
            <strong style="display: block; margin-bottom: 6px;">{{ item.name }}</strong>
            <div style="color: var(--dm-text-soft); font-size: 13px; margin-bottom: 10px;">{{ item.variant }}</div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <div class="dm-card" style="display: inline-flex; align-items: center; box-shadow: none;">
                <button type="button" class="dm-btn-ghost" style="border: 0; border-right: 1px solid var(--dm-border); border-radius: 12px 0 0 12px;">-</button>
                <div style="min-width: 44px; text-align: center; font-weight: 600;">{{ item.qty }}</div>
                <button type="button" class="dm-btn-ghost" style="border: 0; border-left: 1px solid var(--dm-border); border-radius: 0 12px 12px 0;">+</button>
              </div>
              <button type="button" class="dm-btn-danger" style="padding: 10px 12px;">Remove</button>
            </div>
          </div>
          <strong style="font-size: 20px; color: var(--dm-danger);">{{ item.price }}</strong>
        </div>
      </div>
    </article>

    <aside class="dm-card" style="padding: 20px; position: sticky; top: 110px;">
      <h2 style="font-size: 24px; margin-bottom: 16px;">Order Summary</h2>
      <div style="display: grid; gap: 12px; color: var(--dm-text-soft); margin-bottom: 18px;">
        <div style="display: flex; justify-content: space-between; gap: 8px;">
          <span>Subtotal</span>
          <strong style="color: var(--dm-text);">đ 1,319,000</strong>
        </div>
        <div style="display: flex; justify-content: space-between; gap: 8px;">
          <span>Shipping</span>
          <strong style="color: var(--dm-success);">Free</strong>
        </div>
        <div style="display: flex; justify-content: space-between; gap: 8px; padding-top: 12px; border-top: 1px solid var(--dm-border);">
          <span>Total</span>
          <strong style="font-size: 22px; color: var(--dm-danger);">đ 1,319,000</strong>
        </div>
      </div>
      <router-link :to="{ name: 'payment' }" class="dm-btn" style="display: flex; width: 100%; justify-content: center; margin-bottom: 10px;">Proceed to Checkout</router-link>
      <div class="dm-pill" style="width: 100%; justify-content: center; background: rgba(0, 191, 165, 0.08); color: var(--dm-success);">Free Shipping Extra</div>
    </aside>
  </section>
</template>
