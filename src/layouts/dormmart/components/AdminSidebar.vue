<template>
  <aside class="dm-admin__sidebar" :class="{ 'dm-admin__sidebar--collapsed': isCollapsed }">
    <nav class="dm-admin__nav" :aria-label="Text.BrandName">
      <DMButton
        v-for="Item in NavigationItems"
        :key="Item.Path"
        type="none"
        :class="linkClass(Item.Path)"
        :icon-name="Item.Icon"
        :message="isCollapsed ? '' : Item.Label"
        :tooltip-message="Item.Label"
        :is-tooltip="isCollapsed"
        tooltip-position="right"
        :aria-label="Item.Label"
        :aria-current="isActive(Item.Path) ? 'page' : undefined"
        @click="navigate(Item.Path)"
      />
    </nav>

    <DMButton
      type="none"
      class="dm-admin__link dm-admin__logout"
      icon-name="logout"
      :message="isCollapsed ? '' : Text.Logout"
      :tooltip-message="Text.Logout"
      :is-tooltip="isCollapsed"
      tooltip-position="right"
      :aria-label="Text.Logout"
      @click="handleLogout"
    />
  </aside>
</template>

<script setup>
import { computed, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import { logoutUser } from "@/services/authService";

defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

const Route = useRoute();
const Router = useRouter();
const Text = inject("i18nCommon").AdminNavigation;

const NavigationItems = computed(() => [
  { Path: "/admin", Icon: "dashboard", Label: Text.Overview },
  { Path: "/admin/finance", Icon: "monitoring", Label: Text.Finance },
  { Path: "/admin/accounts", Icon: "manage_accounts", Label: Text.Accounts },
  { Path: "/admin/products", Icon: "inventory_2", Label: Text.Products },
  { Path: "/admin/categories", Icon: "category", Label: Text.Categories },
  { Path: "/admin/brands", Icon: "branding_watermark", Label: Text.Brands },
  { Path: "/admin/orders", Icon: "shopping_cart", Label: Text.Orders },
  { Path: "/admin/support", Icon: "support_agent", Label: Text.Support },
  { Path: "/admin/reviews", Icon: "reviews", Label: "Đánh giá" },
  { Path: "/admin/promotions", Icon: "sell", Label: "Khuyến mãi" },
  { Path: "/admin/combos", Icon: "redeem", Label: "Combo" },
  { Path: "/", Icon: "storefront", Label: Text.Storefront },
]);

const isActive = (Path) => Path !== "/" && (Path === "/admin" ? Route.path === Path : Route.path.startsWith(Path));
const linkClass = (Path) => ["dm-admin__link", isActive(Path) ? "dm-admin__link--active" : ""];
const navigate = (Path) => Router.push(Path);
const handleLogout = async () => {
  await logoutUser();
  Router.replace({ name: "login" });
};
</script>
