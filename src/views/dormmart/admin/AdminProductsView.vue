<script setup>
const products = [
  { name: "Lumina Desk Lamp Pro", sku: "LDM-1042-WHT", category: "Appliances", status: "Active", inventory: "142 in stock", price: "$45.00", cost: "$22.00" },
  { name: "Premium 5-Subject Notebook", sku: "STAT-NB5-NVY", category: "Stationery", status: "Low Stock", inventory: "12 in stock", price: "$12.50", cost: "$4.25" },
  { name: "Compact Electric Kettle 1L", sku: "APP-KTL-1L", category: "Appliances", status: "Draft", inventory: "0 in stock", price: "$29.99", cost: "$14.50" },
  { name: "Neon Sticky Notes Pack", sku: "STAT-STKY-5PK", category: "Stationery", status: "Active", inventory: "580 in stock", price: "$5.99", cost: "$1.20" },
];

const statusStyle = (status) => {
  if (status === "Active") return "background: rgba(0,191,165,0.1); color: var(--dm-success);";
  if (status === "Low Stock") return "background: rgba(253,192,3,0.18); color: var(--dm-secondary-text);";
  return "background: var(--dm-surface-soft); color: var(--dm-text-soft);";
};
</script>

<template>
  <section style="display: grid; gap: 18px;">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
      <div>
        <h1 style="font-size: 36px; margin-bottom: 8px;">Products</h1>
        <p style="color: var(--dm-text-soft);">Manage inventory, pricing, and product visibility.</p>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button type="button" class="dm-btn-ghost">Export</button>
        <button type="button" class="dm-btn">Add Product</button>
      </div>
    </div>

    <article class="dm-card" style="overflow: hidden;">
      <div style="padding: 16px; border-bottom: 1px solid var(--dm-border); background: var(--dm-surface-soft); display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: center;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span class="dm-pill" style="background: #fff; color: var(--dm-text); border: 1px solid var(--dm-border);">All Products (1,248)</span>
          <span class="dm-pill" style="background: transparent; color: var(--dm-text-soft);">Active</span>
          <span class="dm-pill" style="background: transparent; color: var(--dm-text-soft);">Draft</span>
          <span class="dm-pill" style="background: transparent; color: var(--dm-text-soft);">Out of Stock</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" class="dm-btn-ghost">Filter</button>
          <button type="button" class="dm-btn-ghost">Sort</button>
        </div>
      </div>

      <div style="overflow-x: auto;">
        <table class="dm-table" style="min-width: 880px;">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Status</th>
              <th>Inventory</th>
              <th>Price</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in products" :key="item.sku">
              <td>
                <div style="font-weight: 700; margin-bottom: 4px;">{{ item.name }}</div>
                <div style="font-size: 13px; color: var(--dm-text-soft);">SKU: {{ item.sku }}</div>
              </td>
              <td>{{ item.category }}</td>
              <td><span class="dm-pill" :style="statusStyle(item.status)">{{ item.status }}</span></td>
              <td>{{ item.inventory }}</td>
              <td>
                <div style="font-weight: 700;">{{ item.price }}</div>
                <div style="font-size: 13px; color: var(--dm-text-soft);">Cost: {{ item.cost }}</div>
              </td>
              <td style="text-align: right;">
                <div style="display: inline-flex; gap: 8px;">
                  <button type="button" class="dm-btn-ghost" style="padding: 8px 10px;">Edit</button>
                  <button type="button" class="dm-btn-danger" style="padding: 8px 10px;">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>
