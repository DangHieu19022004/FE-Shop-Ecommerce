<script setup>
const metrics = [
  { title: "Total Revenue", value: "$12,450", delta: "15.2%", tone: "var(--dm-primary-soft)", icon: "payments" },
  { title: "Total Orders", value: "342", delta: "8.4%", tone: "rgba(253, 192, 3, 0.24)", icon: "local_mall" },
  { title: "Active Products", value: "1,024", delta: "2.1%", tone: "rgba(255, 183, 141, 0.26)", icon: "inventory_2" },
  { title: "New Customers", value: "89", delta: "5.0%", tone: "rgba(255, 218, 214, 0.7)", icon: "group_add" },
];

const orders = [
  { name: "Jordan Lee", code: "#DM-8942", ago: "2m ago", amount: "$45.99", status: "Shipped" },
  { name: "Mia Kim", code: "#DM-8941", ago: "15m ago", amount: "$12.50", status: "Processing" },
  { name: "Tyler Smith", code: "#DM-8940", ago: "1h ago", amount: "$189.00", status: "Shipped" },
  { name: "Alex Brown", code: "#DM-8939", ago: "3h ago", amount: "$24.99", status: "Cancelled" },
];

const alerts = [
  { name: "Portable Mini Washing Machine 4.5L", sku: "SKU: APP-WM-45L", left: "2 Left", note: "Reorder ASAP" },
  { name: "0.5mm Gel Pen Set", sku: "SKU: STN-GP-05", left: "12 Left", note: "Low Stock" },
  { name: "Ergonomic Study Chair", sku: "SKU: FUR-CH-ERGO", left: "15 Left", note: "Low Stock" },
];
</script>

<template>
  <section style="display: grid; gap: 18px;">
    <div class="dm-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
      <article v-for="metric in metrics" :key="metric.title" class="dm-card" style="padding: 22px; position: relative; overflow: hidden;">
        <div :style="{ position: 'absolute', width: '110px', height: '110px', right: '-28px', top: '-28px', borderRadius: '50%', background: metric.tone }"></div>
        <div style="position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 12px;">
          <div>
            <div style="font-size: 12px; text-transform: uppercase; color: var(--dm-text-soft); margin-bottom: 16px;">{{ metric.title }}</div>
            <div style="font-size: 42px; font-weight: 800; line-height: 1; margin-bottom: 18px;">{{ metric.value }}</div>
            <div class="dm-pill" style="background: rgba(0, 191, 165, 0.1); color: var(--dm-success);">{{ metric.delta }}</div>
          </div>
          <div style="width: 44px; height: 44px; border-radius: 12px; background: #fff; display: grid; place-items: center; color: var(--dm-primary); box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            <span class="material-symbols-outlined">{{ metric.icon }}</span>
          </div>
        </div>
      </article>
    </div>

    <div style="display: grid; grid-template-columns: 1.45fr 1fr; gap: 18px; align-items: start;">
      <article class="dm-card" style="padding: 22px;">
        <div style="display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 18px;">
          <h2 style="font-size: 24px;">Revenue & Sales Overview</h2>
          <div style="display: inline-flex; padding: 4px; border-radius: 12px; background: var(--dm-surface-soft); gap: 4px;">
            <button type="button" class="dm-btn-ghost" style="padding: 8px 12px; border: 0; background: #fff;">Week</button>
            <button type="button" class="dm-btn-ghost" style="padding: 8px 12px; border: 0; background: transparent;">Month</button>
          </div>
        </div>
        <div class="dm-card" style="padding: 12px; background: linear-gradient(180deg, rgba(248,249,250,0.95), #fff); box-shadow: none;">
          <svg viewBox="0 0 600 280" style="width: 100%; height: 320px;">
            <path d="M 0 40 L 600 40" fill="none" stroke="#e1e3e4" stroke-dasharray="4 4" />
            <path d="M 0 100 L 600 100" fill="none" stroke="#e1e3e4" stroke-dasharray="4 4" />
            <path d="M 0 160 L 600 160" fill="none" stroke="#e1e3e4" stroke-dasharray="4 4" />
            <path d="M 0 220 L 600 220" fill="none" stroke="#e1e3e4" stroke-dasharray="4 4" />
            <path d="M 0 240 Q 50 180 100 200 T 200 150 T 300 120 T 400 90 T 500 140 T 600 40" fill="none" stroke="url(#adminLineGrad)" stroke-linecap="round" stroke-width="4" />
            <defs>
              <linearGradient id="adminLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#002b6b" />
                <stop offset="100%" stop-color="#fdc003" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="200" r="5" fill="#fff" stroke="#002b6b" stroke-width="3" />
            <circle cx="200" cy="150" r="5" fill="#fff" stroke="#002b6b" stroke-width="3" />
            <circle cx="300" cy="120" r="5" fill="#fff" stroke="#002b6b" stroke-width="3" />
            <circle cx="400" cy="90" r="5" fill="#fff" stroke="#002b6b" stroke-width="3" />
            <circle cx="500" cy="140" r="5" fill="#fff" stroke="#fdc003" stroke-width="3" />
            <circle cx="600" cy="40" r="5" fill="#fff" stroke="#fdc003" stroke-width="3" />
          </svg>
        </div>
      </article>

      <article class="dm-card" style="padding: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px;">
          <h2 style="font-size: 24px;">Recent Orders</h2>
          <router-link to="/admin/orders" style="color: var(--dm-primary); font-weight: 700;">View all</router-link>
        </div>
        <div style="display: grid; gap: 8px;">
          <div v-for="order in orders" :key="order.code" style="display: flex; justify-content: space-between; gap: 12px; padding: 14px 12px; border-radius: 14px; background: var(--dm-surface-soft);">
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">{{ order.name }}</div>
              <div style="font-size: 13px; color: var(--dm-text-soft);">{{ order.code }} • {{ order.ago }}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 700; margin-bottom: 6px;">{{ order.amount }}</div>
              <span class="dm-pill" :style="order.status === 'Cancelled' ? 'background: rgba(186,26,26,0.1); color: var(--dm-danger);' : 'background: rgba(0,191,165,0.1); color: var(--dm-success);'">{{ order.status }}</span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <article class="dm-card" style="padding: 22px;">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px;">
        <h2 style="font-size: 24px; color: var(--dm-danger);">Inventory Alerts</h2>
        <router-link to="/admin/products" class="dm-btn-ghost">Manage Stock</router-link>
      </div>
      <div style="display: grid; gap: 12px;">
        <div v-for="item in alerts" :key="item.sku" style="display: flex; justify-content: space-between; gap: 12px; padding: 14px; border-radius: 14px; background: rgba(255, 218, 214, 0.35);">
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">{{ item.name }}</div>
            <div style="font-size: 13px; color: var(--dm-text-soft);">{{ item.sku }}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 800; color: var(--dm-danger);">{{ item.left }}</div>
            <div style="font-size: 12px; color: var(--dm-text-soft);">{{ item.note }}</div>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
