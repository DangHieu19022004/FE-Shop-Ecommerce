<script setup>
const orders = [
  { id: "#DM-8942", customer: "Jordan Lee", items: 3, total: "$45.99", payment: "Paid", fulfilment: "Shipped", date: "2026-08-15 08:14" },
  { id: "#DM-8941", customer: "Mia Kim", items: 1, total: "$12.50", payment: "Paid", fulfilment: "Processing", date: "2026-08-15 07:58" },
  { id: "#DM-8940", customer: "Tyler Smith", items: 5, total: "$189.00", payment: "Pending", fulfilment: "Ready to Pack", date: "2026-08-15 06:22" },
  { id: "#DM-8939", customer: "Alex Brown", items: 2, total: "$24.99", payment: "Refunded", fulfilment: "Cancelled", date: "2026-08-15 04:41" },
];

const badgeStyle = (status) => {
  if (status === "Paid" || status === "Shipped") return "background: rgba(0,191,165,0.1); color: var(--dm-success);";
  if (status === "Pending" || status === "Processing" || status === "Ready to Pack") return "background: rgba(253,192,3,0.18); color: var(--dm-secondary-text);";
  return "background: rgba(186,26,26,0.1); color: var(--dm-danger);";
};
</script>

<template>
  <section style="display: grid; gap: 18px;">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
      <div>
        <h1 style="font-size: 36px; margin-bottom: 8px;">Orders</h1>
        <p style="color: var(--dm-text-soft);">Track fulfilment, payment, and customer activity.</p>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button type="button" class="dm-btn-ghost">Filter by Date</button>
        <button type="button" class="dm-btn">Export Orders</button>
      </div>
    </div>

    <article class="dm-card" style="overflow: hidden;">
      <div style="padding: 16px; border-bottom: 1px solid var(--dm-border); background: var(--dm-surface-soft); display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: center;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span class="dm-pill" style="background: #fff; color: var(--dm-text); border: 1px solid var(--dm-border);">All Orders (342)</span>
          <span class="dm-pill" style="background: transparent; color: var(--dm-text-soft);">Pending</span>
          <span class="dm-pill" style="background: transparent; color: var(--dm-text-soft);">Shipped</span>
          <span class="dm-pill" style="background: transparent; color: var(--dm-text-soft);">Cancelled</span>
        </div>
        <button type="button" class="dm-btn-ghost">Bulk Actions</button>
      </div>

      <div style="overflow-x: auto;">
        <table class="dm-table" style="min-width: 980px;">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Fulfilment</th>
              <th>Date</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td style="font-weight: 700; color: var(--dm-primary);">{{ order.id }}</td>
              <td>{{ order.customer }}</td>
              <td>{{ order.items }}</td>
              <td style="font-weight: 700;">{{ order.total }}</td>
              <td><span class="dm-pill" :style="badgeStyle(order.payment)">{{ order.payment }}</span></td>
              <td><span class="dm-pill" :style="badgeStyle(order.fulfilment)">{{ order.fulfilment }}</span></td>
              <td>{{ order.date }}</td>
              <td style="text-align: right;">
                <div style="display: inline-flex; gap: 8px;">
                  <button type="button" class="dm-btn-ghost" style="padding: 8px 10px;">Details</button>
                  <button type="button" class="dm-btn-ghost" style="padding: 8px 10px;">Update</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>
