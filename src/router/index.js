import { createRouter, createWebHistory } from "vue-router";
import DemoView from "@/views/DemoView.vue";
import SalaryComposition from "@/feat/salarycomposition/SalaryComposition.vue";
import SalaryCompositionSystem from "@/feat/salarycompositionsystems/SalaryCompositionSystem.vue";
import DormMartPublicLayout from "@/views/dormmart/layouts/DormMartPublicLayout.vue";
import DormMartAdminLayout from "@/views/dormmart/layouts/DormMartAdminLayout.vue";
import DormMartAuthLayout from "@/views/dormmart/layouts/DormMartAuthLayout.vue";
import HomeView from "@/views/dormmart/HomeView.vue";
import ProductListView from "@/views/dormmart/ProductListView.vue";
import ProductDetailView from "@/views/dormmart/ProductDetailView.vue";
import CartView from "@/views/dormmart/CartView.vue";
import CheckoutView from "@/views/dormmart/CheckoutView.vue";
import LoginView from "@/views/dormmart/LoginView.vue";
import RegisterView from "@/views/dormmart/RegisterView.vue";
import AdminDashboardView from "@/views/dormmart/admin/AdminDashboardView.vue";
import AdminProductsView from "@/views/dormmart/admin/AdminProductsView.vue";
import AdminOrdersView from "@/views/dormmart/admin/AdminOrdersView.vue";

/**
 * Khai báo danh sách các tuyến đường (routes) của ứng dụng.
 *
 * Sử dụng khi: Khởi tạo router để Vue biết cách điều hướng.
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const routes = [
  {
    path: "/",
    component: DormMartPublicLayout,
    children: [
      {
        path: "",
        name: "home",
        component: HomeView,
      },
      {
        path: "products",
        name: "productList",
        component: ProductListView,
      },
      {
        path: "products/:slug",
        name: "productDetail",
        component: ProductDetailView,
      },
      {
        path: "cart",
        name: "cart",
        component: CartView,
      },
      {
        path: "checkout",
        name: "checkout",
        component: CheckoutView,
      },
    ],
  },
  {
    path: "/login",
    component: DormMartAuthLayout,
    children: [
      {
        path: "",
        name: "login",
        component: LoginView,
      },
    ],
  },
  {
    path: "/register",
    component: DormMartAuthLayout,
    children: [
      {
        path: "",
        name: "register",
        component: RegisterView,
      },
    ],
  },
  {
    path: "/admin",
    component: DormMartAdminLayout,
    children: [
      {
        path: "",
        name: "adminDashboard",
        component: AdminDashboardView,
      },
      {
        path: "products",
        name: "adminProducts",
        component: AdminProductsView,
      },
      {
        path: "orders",
        name: "adminOrders",
        component: AdminOrdersView,
      },
    ],
  },
  {
    path: "/demo",
    name: "demoView",
    component: DemoView,
  },
  {
    path: "/salarycomposition",
    name: "salaryComposition",
    component: SalaryComposition,
  },
  {
    path: "/salarycomposition/salarycomposition-system",
    name: "salaryCompositionSystem",
    component: SalaryCompositionSystem,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
