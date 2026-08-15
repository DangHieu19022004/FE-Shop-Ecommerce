<script setup>
const metrics = [
  {
    title: "Total Revenue",
    value: "$12,450",
    delta: "15.2%",
    positive: true,
    icon: "payments",
    accentClass: "metric-card--blue",
  },
  {
    title: "Total Orders",
    value: "342",
    delta: "8.4%",
    positive: true,
    icon: "local_mall",
    accentClass: "metric-card--gold",
  },
  {
    title: "Active Products",
    value: "1,024",
    delta: "2.1%",
    positive: true,
    icon: "inventory_2",
    accentClass: "metric-card--peach",
  },
  {
    title: "New Customers",
    value: "89",
    delta: "5.0%",
    positive: false,
    icon: "group_add",
    accentClass: "metric-card--red",
  },
];

const orders = [
  { initials: "JL", name: "Jordan Lee", code: "#DM-8942", ago: "2m ago", amount: "$45.99", status: "Shipped" },
  { initials: "MK", name: "Mia Kim", code: "#DM-8941", ago: "15m ago", amount: "$12.50", status: "Processing" },
  { initials: "TS", name: "Tyler Smith", code: "#DM-8940", ago: "1h ago", amount: "$189.00", status: "Shipped" },
  { initials: "AB", name: "Alex Brown", code: "#DM-8939", ago: "3h ago", amount: "$24.99", status: "Cancelled" },
];

const products = [
  {
    label: "#1 HOT",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAI-Ld3_-J_ZcD-CiKF1-htD8B89N9DU_cBLCF9bJN-C4bp-K41WFl0MbH92n4y5ull-4L_Wz6Mvq3C-sa91gC4arkMd6r43hUrDAg7xpTxXXBYzTaISSMYSPChuZiI7CQq3IcXdGdp9ysoj6QBBjymF4rTFvqtXw7_21VObnEGMJ_qcLz_pSzoRL9ItBMbnnXgnJLC793t55KGn4kdlSvg1R1xXs05vgILHTJHCvYHw2ftzwsM7on41A",
    name: "LED Desk Lamp with USB Port",
    sold: "432 units sold",
  },
  {
    label: "#2",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA9WeaTGoysh6NENQNpTk9v33-RhMJ77oCaRmk9aKukdNqLXeXydigKG2JI__aYMiRFPJ5CbHuvaiSG-z7f3kJfSyVaByV6Zz2XmHtUY34bn7wWEfRzOhq9VlVit200GrL8uSQP-PMh-QfwW24oGF9Wlz2HuBQyvYiLk3Bgfw063SxSTcMImWuEYBm47UwBHE6gEd_lbafBgEJ_WHNsxH2l1IYLOqGHszW1BZllnwn3Avln8zJFyN_I_A",
    name: "Spicy Ramen Bulk Pack (24x)",
    sold: "389 units sold",
  },
];

const inventoryAlerts = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7xrTr-iQnt5BmR-pqKgGBKH_X3vQE1S5ZhQpZgx1d9TfdnYBjr9lFz6wpnRuFOSX1pBa3e5dXvdx_xOkZBqAGUBYB6pKpy5vdffBx4NNMGhvIDFcFJUP0zIphoD20Bu7lQeJzSozu3299UjedW_F1lERydlrw18ilv52V9rEREY40rWTkVPK26as72yUpH9Sdck6wrt6dF8PMI25gUR_86bqlVsAJHkUb5WdtZFcjaVI1cnRD7BSn7A",
    name: "Portable Mini Washing Machine 4.5L",
    sku: "SKU: APP-WM-45L",
    left: "2 Left",
    note: "Reorder ASAP",
    tone: "danger",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtXBLFghDcRBt6BcsHM83bHZc_dywNmA03TA9Ep9QBeuIdKDSLonjsNry5SNqjJkom8Kzk-OZj925PhmMr-7XgxdWTvwOs5C-d-MKzgTTHjX7OxuY2nfisQfb7H6tW-2TCdyzhdYny-iVCV_WSioLUhhNNG4cvU_pO7yDp8ihlFGrUVwQzCpWFJlY6yLZan4y89laQYcx0KVClTH0ankf2z5pXB0kcanAl8rpvnA9dwO8EKbngJr8auA",
    name: "0.5mm Gel Pen Set (Black/Blue/Red)",
    sku: "SKU: STN-GP-05",
    left: "12 Left",
    note: "Low Stock",
    tone: "warning",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA6BVZYrBcdAXU1CHzYiF09sAhr-447lALmQxoq10uOhwbiUQKkjiTjQXSEdA23tYg2oj_HICPvf1RwSLh2gaeUTGsFdTJsG4XCvUUR4SSaBCzMEjNoYkP3E4xG6oZa8k-4pjgmpQu8vEt7ozaylFIm4jaIse_rk9jJdxFNZ5B_1TMohVk6qREibfmKzv2EesOc8ZXRSyFcL7EePD5Uxq0S8CN9VCAXAJTdoYoYJURvQ5s26zeF2YXz-g",
    name: "Ergonomic Study Chair",
    sku: "SKU: FUR-CH-ERGO",
    left: "15 Left",
    note: "Low Stock",
    tone: "warning",
  },
];
</script>

<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="brand">
        <img
          src="https://lh3.googleusercontent.com/aida/AP1WRLt66z9jsS2Ku4bPKG6Meq2mQ00JChY9WVQW2pybOsyeXTyDAmj7Y37YWx-JoTVpjzuqCbW7qk5qNuT9rglsKx80DGDsn0N4_BpvEb39ITMT0ESbA1Gj63Bg2vhEMGBYACxOEZLijOfhINFPr_u_Swfe55uTB5haYtrb2vv8wt7wtqoZqFXNq4rVBosNSyU6fKPGNfTotXZcgEo6BMQ6N97IsFvl3rdYyk-cHuYTItRDJTQFNQ79GakC6WU56THOpvhD_SzBxsGR65k"
          alt="Dorm Mart"
        />
        <span>Dorm Mart</span>
      </div>

      <nav class="sidebar-nav">
        <a class="nav-item nav-item--active" href="#">
          <span class="material-symbols-outlined">dashboard</span>
          <span>Overview</span>
        </a>
        <a class="nav-item" href="#">
          <span class="material-symbols-outlined">inventory_2</span>
          <span>Products</span>
        </a>
        <a class="nav-item" href="#">
          <span class="material-symbols-outlined">shopping_cart</span>
          <span>Orders</span>
        </a>
        <a class="nav-item" href="#">
          <span class="material-symbols-outlined">group</span>
          <span>Customers</span>
        </a>
        <a class="nav-item" href="#">
          <span class="material-symbols-outlined">package_2</span>
          <span>Inventory</span>
        </a>
        <a class="nav-item" href="#">
          <span class="material-symbols-outlined">payments</span>
          <span>Finance</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <a href="#">
          <span class="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </a>
      </div>
    </aside>

    <div class="content">
      <header class="topbar">
        <div class="search">
          <span class="material-symbols-outlined">search</span>
          <input type="text" placeholder="Search products, orders..." />
        </div>

        <div class="topbar-actions">
          <button type="button" class="icon-btn" aria-label="Notifications">
            <span class="material-symbols-outlined">notifications</span>
            <span class="dot"></span>
          </button>

          <div class="profile">
            <div class="profile__text">
              <p>Admin User</p>
              <span>Super Admin</span>
            </div>
            <div class="profile__avatar">
              <span class="material-symbols-outlined">person</span>
            </div>
          </div>
        </div>
      </header>

      <main class="dashboard">
        <section class="metrics-grid">
          <article
            v-for="metric in metrics"
            :key="metric.title"
            class="metric-card"
            :class="metric.accentClass"
          >
            <div class="metric-card__head">
              <span>{{ metric.title }}</span>
              <div class="metric-card__icon">
                <span class="material-symbols-outlined">{{ metric.icon }}</span>
              </div>
            </div>

            <div class="metric-card__value">{{ metric.value }}</div>

            <div class="metric-card__delta">
              <span class="delta-badge" :class="{ 'delta-badge--down': !metric.positive }">
                <span class="material-symbols-outlined">
                  {{ metric.positive ? "trending_up" : "trending_down" }}
                </span>
                {{ metric.delta }}
              </span>
              <span class="delta-note">vs last week</span>
            </div>
          </article>
        </section>

        <section class="middle-grid">
          <article class="panel chart-panel">
            <div class="panel__head">
              <h2>Revenue &amp; Sales Overview</h2>
              <div class="segmented">
                <button type="button" class="segmented__item segmented__item--active">Week</button>
                <button type="button" class="segmented__item">Month</button>
              </div>
            </div>

            <div class="chart-wrap">
              <svg viewBox="0 0 600 280" class="chart" aria-hidden="true">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stop-color="#002b6b" />
                    <stop offset="100%" stop-color="#fdc003" />
                  </linearGradient>
                </defs>
                <path d="M 0 40 L 600 40" fill="none" stroke="#e1e3e4" stroke-dasharray="4 4" />
                <path d="M 0 100 L 600 100" fill="none" stroke="#e1e3e4" stroke-dasharray="4 4" />
                <path d="M 0 160 L 600 160" fill="none" stroke="#e1e3e4" stroke-dasharray="4 4" />
                <path d="M 0 220 L 600 220" fill="none" stroke="#e1e3e4" stroke-dasharray="4 4" />
                <path d="M 0 280 L 600 280" fill="none" stroke="#e1e3e4" stroke-dasharray="4 4" />
                <path
                  d="M 0 240 Q 50 180 100 200 T 200 150 T 300 120 T 400 90 T 500 140 T 600 40"
                  fill="none"
                  stroke="url(#lineGrad)"
                  stroke-linecap="round"
                  stroke-width="4"
                />
                <circle cx="100" cy="200" r="5" fill="#fff" stroke="#002b6b" stroke-width="3" />
                <circle cx="200" cy="150" r="5" fill="#fff" stroke="#002b6b" stroke-width="3" />
                <circle cx="300" cy="120" r="5" fill="#fff" stroke="#002b6b" stroke-width="3" />
                <circle cx="400" cy="90" r="5" fill="#fff" stroke="#002b6b" stroke-width="3" />
                <circle cx="500" cy="140" r="5" fill="#fff" stroke="#fdc003" stroke-width="3" />
                <circle cx="600" cy="40" r="5" fill="#fff" stroke="#fdc003" stroke-width="3" />
                <text x="0" y="295">Mon</text>
                <text x="100" y="295" text-anchor="middle">Tue</text>
                <text x="200" y="295" text-anchor="middle">Wed</text>
                <text x="300" y="295" text-anchor="middle">Thu</text>
                <text x="400" y="295" text-anchor="middle">Fri</text>
                <text x="500" y="295" text-anchor="middle">Sat</text>
                <text x="600" y="295" text-anchor="end">Sun</text>
              </svg>
            </div>
          </article>

          <article class="panel orders-panel">
            <div class="panel__head">
              <h2>Recent Orders</h2>
              <a href="#">VIEW ALL</a>
            </div>

            <div class="order-list">
              <div v-for="order in orders" :key="order.code" class="order-item">
                <div class="order-item__left">
                  <div class="avatar" :class="`avatar--${order.initials.toLowerCase()}`">
                    {{ order.initials }}
                  </div>
                  <div>
                    <div class="order-item__name">{{ order.name }}</div>
                    <div class="order-item__meta">{{ order.code }} • {{ order.ago }}</div>
                  </div>
                </div>

                <div class="order-item__right">
                  <div class="order-item__amount">{{ order.amount }}</div>
                  <span class="status-badge" :class="`status-badge--${order.status.toLowerCase()}`">
                    {{ order.status }}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section class="bottom-grid">
          <article class="panel products-panel">
            <div class="panel__head">
              <h2 class="with-icon">
                <span class="material-symbols-outlined text-gold">local_fire_department</span>
                Top Selling Products
              </h2>
            </div>

            <div class="product-grid">
              <article v-for="product in products" :key="product.name" class="product-card">
                <div class="product-card__image-wrap">
                  <img :src="product.image" :alt="product.name" />
                  <span class="product-card__label">{{ product.label }}</span>
                </div>
                <div class="product-card__name">{{ product.name }}</div>
                <div class="product-card__sold">{{ product.sold }}</div>
              </article>
            </div>
          </article>

          <article class="panel inventory-panel">
            <div class="panel__head">
              <h2 class="with-icon">
                <span class="material-symbols-outlined text-red">warning</span>
                Inventory Alerts
              </h2>
              <button type="button" class="pill-button">Manage Stock</button>
            </div>

            <div class="inventory-list">
              <div
                v-for="item in inventoryAlerts"
                :key="item.sku"
                class="inventory-item"
                :class="`inventory-item--${item.tone}`"
              >
                <img :src="item.image" :alt="item.name" class="inventory-item__image" />
                <div class="inventory-item__body">
                  <div class="inventory-item__name">{{ item.name }}</div>
                  <div class="inventory-item__sku">{{ item.sku }}</div>
                </div>
                <div class="inventory-item__stock">
                  <div class="inventory-item__left">{{ item.left }}</div>
                  <div class="inventory-item__note">{{ item.note }}</div>
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");

:global(body) {
  margin: 0;
  font-family: "Inter", sans-serif;
  background: #f8f9fa;
  color: #191c1d;
}

:global(*) {
  box-sizing: border-box;
}

:global(a) {
  color: inherit;
  text-decoration: none;
}

.admin-shell {
  min-height: 100vh;
  display: flex;
  background: #f8f9fa;
}

.sidebar {
  width: 256px;
  min-height: 100vh;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: sticky;
  top: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
}

.brand img {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.brand span {
  font-size: 30px;
  font-weight: 700;
  color: #002b6b;
  letter-spacing: -0.03em;
}

.sidebar-nav {
  padding: 16px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  color: #434651;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.nav-item .material-symbols-outlined {
  font-size: 22px;
}

.nav-item:hover {
  background: #f3f4f5;
  color: #191c1d;
}

.nav-item--active {
  background: #002b6b;
  color: #fff;
  box-shadow: 0 8px 18px rgba(0, 43, 107, 0.18);
}

.sidebar-footer {
  padding: 20px 18px 28px;
}

.sidebar-footer a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 14px;
  color: #ba1a1a;
  font-size: 18px;
}

.sidebar-footer .material-symbols-outlined {
  font-size: 22px;
}

.content {
  flex: 1;
  min-width: 0;
}

.topbar {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 32px;
  border-bottom: 1px solid #e8e8e8;
  background: rgba(248, 249, 250, 0.86);
  backdrop-filter: blur(18px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.search {
  width: min(100%, 460px);
  height: 42px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border: 1px solid #e8e8e8;
  border-radius: 14px;
  background: #fff;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
}

.search .material-symbols-outlined {
  color: #747782;
  font-size: 22px;
}

.search input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #191c1d;
}

.search input::placeholder {
  color: #747782;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 22px;
}

.icon-btn {
  position: relative;
  border: 0;
  background: transparent;
  color: #434651;
  cursor: pointer;
  padding: 8px;
}

.icon-btn .material-symbols-outlined {
  font-size: 28px;
}

.dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #785900;
  border: 2px solid #f8f9fa;
}

.profile {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-left: 18px;
  border-left: 1px solid #e8e8e8;
}

.profile__text {
  text-align: right;
}

.profile__text p {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.profile__text span {
  font-size: 13px;
  color: #434651;
}

.profile__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #002b6b;
  color: #fff;
  display: grid;
  place-items: center;
}

.profile__avatar .material-symbols-outlined {
  font-size: 22px;
}

.dashboard {
  padding: 32px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  padding: 24px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(232, 232, 232, 0.8);
}

.metric-card::after {
  content: "";
  position: absolute;
  right: -22px;
  top: -22px;
  width: 94px;
  height: 94px;
  border-radius: 50%;
  opacity: 0.18;
  filter: blur(12px);
}

.metric-card--blue::after {
  background: #1a428a;
}

.metric-card--gold::after {
  background: #fdc003;
}

.metric-card--peach::after {
  background: #f99c63;
}

.metric-card--red::after {
  background: #ba1a1a;
}

.metric-card__head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.metric-card__head span:first-child {
  text-transform: uppercase;
  color: #434651;
  font-size: 13px;
  letter-spacing: 0.08em;
}

.metric-card__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
}

.metric-card--blue .metric-card__icon {
  background: #dae2ff;
  color: #002b6b;
}

.metric-card--gold .metric-card__icon {
  background: #ffdf9e;
  color: #785900;
}

.metric-card--peach .metric-card__icon {
  background: #ffdbc9;
  color: #502100;
}

.metric-card--red .metric-card__icon {
  background: #ffdad6;
  color: #ba1a1a;
}

.metric-card__icon .material-symbols-outlined {
  font-size: 22px;
}

.metric-card__value {
  position: relative;
  z-index: 1;
  margin-top: 28px;
  font-size: 52px;
  line-height: 1;
  font-weight: 800;
}

.metric-card__delta {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
}

.delta-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0, 183, 170, 0.1);
  color: #00bfa5;
  font-weight: 600;
  font-size: 13px;
}

.delta-badge--down {
  background: rgba(186, 26, 26, 0.1);
  color: #ba1a1a;
}

.delta-badge .material-symbols-outlined {
  font-size: 14px;
}

.delta-note {
  color: #434651;
  font-size: 13px;
}

.middle-grid,
.bottom-grid {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.middle-grid {
  grid-template-columns: 1.45fr 1fr;
  align-items: stretch;
}

.bottom-grid {
  grid-template-columns: 1fr 1fr;
}

.panel {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(232, 232, 232, 0.8);
}

.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.panel__head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.panel__head a {
  color: #002b6b;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.with-icon {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.text-gold {
  color: #785900;
}

.text-red {
  color: #ba1a1a;
}

.segmented {
  display: inline-flex;
  padding: 4px;
  border-radius: 12px;
  background: #f3f4f5;
}

.segmented__item {
  border: 0;
  background: transparent;
  padding: 7px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #434651;
}

.segmented__item--active {
  background: #fff;
  color: #191c1d;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.chart-wrap {
  min-height: 360px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(248, 249, 250, 0.95), rgba(255, 255, 255, 1));
  padding: 12px 4px 0;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart text {
  font-family: "Inter", sans-serif;
  font-size: 12px;
  fill: #747782;
}

.orders-panel .order-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 12px;
  border-radius: 14px;
}

.order-item:hover {
  background: #f8f9fa;
}

.order-item__left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 600;
  color: #785900;
  background: #ffdf9e;
}

.avatar--mk {
  color: #001742;
  background: #dae2ff;
}

.avatar--ts {
  color: #502100;
  background: #ffdbc9;
}

.avatar--ab {
  color: #ba1a1a;
  background: #ffdad6;
}

.order-item__name {
  font-size: 15px;
  font-weight: 500;
}

.order-item__meta {
  margin-top: 2px;
  color: #434651;
  font-size: 13px;
}

.order-item__right {
  text-align: right;
  flex-shrink: 0;
}

.order-item__amount {
  font-size: 18px;
  font-weight: 700;
}

.status-badge {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge--shipped {
  color: #00bfa5;
  background: rgba(0, 191, 165, 0.12);
}

.status-badge--processing {
  color: #434651;
  background: #e1e3e4;
}

.status-badge--cancelled {
  color: #ba1a1a;
  background: #ffdad6;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.product-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-card__image-wrap {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 14px;
  background: #f3f4f5;
}

.product-card__image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__label {
  position: absolute;
  left: 10px;
  top: 10px;
  padding: 4px 8px;
  border-radius: 6px;
  background: #785900;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.product-card__name {
  font-size: 15px;
  line-height: 1.4;
}

.product-card__sold {
  color: #434651;
  font-size: 13px;
}

.inventory-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pill-button {
  border: 1px solid #c4c6d2;
  background: transparent;
  border-radius: 999px;
  padding: 8px 18px;
  color: #191c1d;
  cursor: pointer;
}

.inventory-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 14px;
}

.inventory-item--danger {
  background: rgba(255, 218, 214, 0.5);
}

.inventory-item--warning {
  background: #f8f9fa;
}

.inventory-item__image {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.inventory-item__body {
  min-width: 0;
  flex: 1;
}

.inventory-item__name {
  font-size: 15px;
  line-height: 1.4;
}

.inventory-item__sku {
  margin-top: 4px;
  color: #434651;
  font-size: 13px;
}

.inventory-item__stock {
  text-align: right;
  flex-shrink: 0;
}

.inventory-item__left {
  font-size: 18px;
  font-weight: 700;
  color: #ba1a1a;
}

.inventory-item__note {
  margin-top: 4px;
  color: #ba1a1a;
  font-size: 12px;
  letter-spacing: 0.08em;
}

.inventory-item--warning .inventory-item__left {
  color: #fdc003;
}

.inventory-item--warning .inventory-item__note {
  color: #434651;
}

@media (max-width: 1180px) {
  .sidebar {
    width: 220px;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .middle-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .admin-shell {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    min-height: auto;
    position: relative;
  }

  .topbar {
    padding: 0 18px;
    flex-wrap: wrap;
    height: auto;
    min-height: 80px;
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .search {
    width: 100%;
    order: 2;
  }

  .topbar-actions {
    margin-left: auto;
  }

  .dashboard {
    padding: 18px;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .panel,
  .metric-card {
    border-radius: 16px;
    padding: 18px;
  }

  .metric-card__value {
    font-size: 42px;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }

  .profile__text {
    display: none;
  }

  .order-item,
  .inventory-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .order-item__right,
  .inventory-item__stock {
    text-align: left;
  }
}
</style>
