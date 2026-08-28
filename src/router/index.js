import { createRouter, createWebHistory } from "vue-router";
import DormMartPublicLayout from "@/views/dormmart/layouts/DormMartPublicLayout.vue";
import DormMartAdminLayout from "@/views/dormmart/layouts/DormMartAdminLayout.vue";
import DormMartAuthLayout from "@/views/dormmart/layouts/DormMartAuthLayout.vue";
import HomeView from "@/views/dormmart/HomeView.vue";
import ProductListView from "@/views/dormmart/ProductListView.vue";
import ProductDetailView from "@/views/dormmart/ProductDetailView.vue";
import CartView from "@/views/dormmart/CartView.vue";
import CheckoutView from "@/views/dormmart/CheckoutView.vue";
import PaymentView from "@/views/dormmart/PaymentView.vue";
import OrderHistoryView from "@/views/dormmart/OrderHistoryView.vue";
import OrderDetailView from "@/views/dormmart/OrderDetailView.vue";
import SupportView from "@/views/dormmart/SupportView.vue";
import LoginView from "@/views/dormmart/LoginView.vue";
import RegisterView from "@/views/dormmart/RegisterView.vue";
import ForgotPasswordView from "@/views/dormmart/ForgotPasswordView.vue";
import ProfileView from "@/views/dormmart/ProfileView.vue";
import LoyaltyView from "@/views/dormmart/LoyaltyView.vue";
import NotificationsView from "@/views/dormmart/NotificationsView.vue";
import MyReviewsView from "@/views/dormmart/MyReviewsView.vue";
import { getCurrentSession } from "@/services/authService";
import AdminDashboardView from "@/views/dormmart/admin/AdminDashboardView.vue";
import AdminProductsView from "@/views/dormmart/admin/AdminProductsView.vue";
import AdminOrdersView from "@/views/dormmart/admin/AdminOrdersView.vue";
import AdminFinanceView from "@/views/dormmart/admin/AdminFinanceView.vue";
import AdminAccountsView from "@/views/dormmart/admin/AdminAccountsView.vue";
import AdminSupportView from "@/views/dormmart/admin/AdminSupportView.vue";
import AdminReviewsView from "@/views/dormmart/admin/AdminReviewsView.vue";

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
      {
        path: "profile",
        name: "profile",
        component: ProfileView,
        meta: { RequiresAuth: true },
      },
      {
        path: "profile/loyalty",
        name: "loyalty",
        component: LoyaltyView,
        meta: { RequiresAuth: true },
      },
      {
        path: "profile/notifications",
        name: "notifications",
        component: NotificationsView,
        meta: { RequiresAuth: true },
      },
      {
        path: "profile/reviews",
        name: "myReviews",
        component: MyReviewsView,
        meta: { RequiresAuth: true },
      },
      {
        path: "payment",
        name: "payment",
        component: PaymentView,
        meta: { RequiresAuth: true },
      },
      { path: "orders", name: "orderHistory", component: OrderHistoryView, meta: { RequiresAuth: true } },
      { path: "orders/:orderCode", name: "orderDetail", component: OrderDetailView, meta: { RequiresAuth: true } },
      { path: "support", name: "support", component: SupportView, meta: { RequiresAuth: true } },
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
    path: "/forgot-password",
    component: DormMartAuthLayout,
    children: [
      {
        path: "",
        name: "forgotPassword",
        component: ForgotPasswordView,
      },
    ],
  },
  {
    path: "/admin",
    component: DormMartAdminLayout,
    meta: { RequiresAuth: true, RequiresAdmin: true },
    children: [
      {
        path: "",
        name: "adminDashboard",
        component: AdminDashboardView,
      },
      {
        path: "finance",
        name: "adminFinance",
        component: AdminFinanceView,
      },
      {
        path: "accounts",
        name: "adminAccounts",
        component: AdminAccountsView,
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
      {
        path: "support",
        name: "adminSupport",
        component: AdminSupportView,
      },
      {
        path: "reviews",
        name: "adminReviews",
        component: AdminReviewsView,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((ToRoute) => {
  const SessionData = getCurrentSession();

  if (ToRoute.meta.RequiresAuth && !SessionData) {
    return { name: "login", query: { Redirect: ToRoute.fullPath } };
  }

  if (ToRoute.meta.RequiresAdmin && !SessionData?.Roles?.includes("Admin")) {
    return { name: "home" };
  }

  return true;
});

export default router;
