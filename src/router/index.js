import { createRouter, createWebHistory } from "vue-router";
import DormMartPublicLayout from "@/views/dormmart/layouts/DormMartPublicLayout.vue";
import DormMartAdminLayout from "@/views/dormmart/layouts/DormMartAdminLayout.vue";
import DormMartAuthLayout from "@/views/dormmart/layouts/DormMartAuthLayout.vue";
import HomeView from "@/views/dormmart/HomeView.vue";
import AboutView from "@/views/dormmart/AboutView.vue";
import ProductListView from "@/views/dormmart/ProductListView.vue";
import ProductDetailView from "@/views/dormmart/ProductDetailView.vue";
import ComboListView from "@/views/dormmart/ComboListView.vue";
import ComboDetailView from "@/views/dormmart/ComboDetailView.vue";
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
import AdminCategoriesView from "@/views/dormmart/admin/AdminCategoriesView.vue";
import AdminBrandsView from "@/views/dormmart/admin/AdminBrandsView.vue";
import AdminOrdersView from "@/views/dormmart/admin/AdminOrdersView.vue";
import AdminFinanceView from "@/views/dormmart/admin/AdminFinanceView.vue";
import AdminAccountsView from "@/views/dormmart/admin/AdminAccountsView.vue";
import AdminSupportView from "@/views/dormmart/admin/AdminSupportView.vue";
import AdminReviewsView from "@/views/dormmart/admin/AdminReviewsView.vue";
import AdminPromotionsView from "@/views/dormmart/admin/AdminPromotionsView.vue";
import AdminCombosView from "@/views/dormmart/admin/AdminCombosView.vue";
import i18nCommon from "@/i18n/i18nCommon";

const placeholderRouteName = "featureUnavailable";
const FeatureUnavailableText = i18nCommon.FeatureUnavailable;
const defaultComingSoonTitle = FeatureUnavailableText.DefaultTitle;
const defaultComingSoonDescription = FeatureUnavailableText.DefaultDescription;

const inactiveRouteMeta = (Overrides = {}) => ({
  isActive: false,
  comingSoonTitle: defaultComingSoonTitle,
  comingSoonDescription: defaultComingSoonDescription,
  ...Overrides,
});

const buildInactiveRedirectQuery = (ToRoute) => ({
  from: ToRoute.fullPath,
  title: ToRoute.meta?.comingSoonTitle || defaultComingSoonTitle,
  description: ToRoute.meta?.comingSoonDescription || defaultComingSoonDescription,
});

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
        meta: { isActive: true },
      },
      {
        path: "products",
        name: "productList",
        component: ProductListView,
        meta: { isActive: true },
      },
      {
        path: "combos",
        name: "comboList",
        component: ComboListView,
        meta: { isActive: true },
      },
      {
        path: "combos/:slug",
        name: "comboDetail",
        component: ComboDetailView,
        meta: { isActive: true },
      },
      {
        path: "about",
        name: "about",
        component: AboutView,
        meta: inactiveRouteMeta({
          comingSoonTitle: FeatureUnavailableText.AboutTitle,
          comingSoonDescription: FeatureUnavailableText.AboutDescription,
        }),
      },
      {
        path: "feature-unavailable",
        name: placeholderRouteName,
        component: AboutView,
        meta: { isActive: true },
      },
      {
        path: "products/:slug",
        name: "productDetail",
        component: ProductDetailView,
        meta: { isActive: true },
      },
      {
        path: "shop",
        name: "cart",
        component: CartView,
        meta: { isActive: true },
      },
      {
        path: "checkout",
        name: "checkout",
        component: CheckoutView,
        meta: inactiveRouteMeta({
          comingSoonTitle: FeatureUnavailableText.CheckoutTitle,
          comingSoonDescription: FeatureUnavailableText.CheckoutDescription,
        }),
      },
      {
        path: "profile",
        name: "profile",
        component: ProfileView,
        meta: { RequiresAuth: true, isActive: true },
      },
      {
        path: "profile/loyalty",
        name: "loyalty",
        component: LoyaltyView,
        meta: { RequiresAuth: true, isActive: true },
      },
      {
        path: "profile/notifications",
        name: "notifications",
        component: NotificationsView,
        meta: { RequiresAuth: true, isActive: true },
      },
      {
        path: "profile/reviews",
        name: "myReviews",
        component: MyReviewsView,
        meta: { RequiresAuth: true, isActive: true },
      },
      {
        path: "payment",
        name: "payment",
        component: PaymentView,
        meta: { RequiresAuth: true, isActive: true },
      },
      {
        path: "orders",
        name: "orderHistory",
        component: OrderHistoryView,
        meta: { RequiresAuth: true, isActive: true },
      },
      {
        path: "orders/:orderCode",
        name: "orderDetail",
        component: OrderDetailView,
        meta: { RequiresAuth: true, isActive: true },
      },
      {
        path: "support",
        name: "support",
        component: SupportView,
        meta: { RequiresAuth: true, isActive: true },
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
        meta: { isActive: true },
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
        meta: { isActive: true },
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
        meta: { isActive: true },
      },
    ],
  },
  {
    path: "/admin",
    component: DormMartAdminLayout,
    meta: { RequiresAuth: true, RequiresAdmin: true, isActive: true },
    children: [
      {
        path: "",
        name: "adminDashboard",
        component: AdminDashboardView,
        meta: { isActive: true },
      },
      {
        path: "finance",
        name: "adminFinance",
        component: AdminFinanceView,
        meta: { isActive: true },
      },
      {
        path: "accounts",
        name: "adminAccounts",
        component: AdminAccountsView,
        meta: { isActive: true },
      },
      {
        path: "products",
        name: "adminProducts",
        component: AdminProductsView,
        meta: { isActive: true },
      },
      {
        path: "categories",
        name: "adminCategories",
        component: AdminCategoriesView,
        meta: { isActive: true },
      },
      {
        path: "brands",
        name: "adminBrands",
        component: AdminBrandsView,
        meta: { isActive: true },
      },
      {
        path: "orders",
        name: "adminOrders",
        component: AdminOrdersView,
        meta: { isActive: true },
      },
      {
        path: "support",
        name: "adminSupport",
        component: AdminSupportView,
        meta: { isActive: true },
      },
      {
        path: "reviews",
        name: "adminReviews",
        component: AdminReviewsView,
        meta: { isActive: true },
      },
      {
        path: "promotions",
        name: "adminPromotions",
        component: AdminPromotionsView,
        meta: { isActive: true },
      },
      {
        path: "combos",
        name: "adminCombos",
        component: AdminCombosView,
        meta: { isActive: true },
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

  if (ToRoute.name !== placeholderRouteName && ToRoute.meta?.isActive === false) {
    return {
      name: placeholderRouteName,
      query: buildInactiveRedirectQuery(ToRoute),
    };
  }

  return true;
});

export default router;
