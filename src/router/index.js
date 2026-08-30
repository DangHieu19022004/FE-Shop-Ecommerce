import { createRouter, createWebHistory } from "vue-router";
import DormMartPublicLayout from "@/views/dormmart/layouts/DormMartPublicLayout.vue";
import DormMartAdminLayout from "@/layouts/dormmart/AdminLayout.vue";
import DormMartAuthLayout from "@/layouts/dormmart/AuthLayout.vue";
import Home from "@/views/dormmart/Home/Home.vue";
import CatalogList from "@/views/dormmart/Catalog/CatalogList.vue";
import CatalogDetail from "@/views/dormmart/Catalog/CatalogDetail.vue";
import ComboList from "@/views/dormmart/Combo/ComboList.vue";
import ComboDetail from "@/views/dormmart/Combo/ComboDetail.vue";
import Cart from "@/views/dormmart/Cart/Cart.vue";
import Checkout from "@/views/dormmart/Checkout/Checkout.vue";
import Payment from "@/views/dormmart/Checkout/Payment.vue";
import OrderHistory from "@/views/dormmart/Order/OrderHistory.vue";
import OrderDetail from "@/views/dormmart/Order/OrderDetail.vue";
import Support from "@/views/dormmart/Support/Support.vue";
import Login from "@/views/dormmart/Auth/Login.vue";
import Register from "@/views/dormmart/Auth/Register.vue";
import ForgotPassword from "@/views/dormmart/Auth/ForgotPassword.vue";
import Profile from "@/views/dormmart/Profile/Profile.vue";
import Loyalty from "@/views/dormmart/Profile/Loyalty.vue";
import Notifications from "@/views/dormmart/Profile/Notifications.vue";
import MyReviews from "@/views/dormmart/Profile/MyReviews.vue";
import { getCurrentSession } from "@/services/authService";
import AdminDashboard from "@/views/dormmart/Admin/AdminDashboard.vue";
import AdminProducts from "@/views/dormmart/Admin/AdminProducts.vue";
import AdminCategories from "@/views/dormmart/Admin/AdminCategories.vue";
import AdminBrands from "@/views/dormmart/Admin/AdminBrands.vue";
import AdminOrders from "@/views/dormmart/Admin/AdminOrders.vue";
import AdminFinance from "@/views/dormmart/Admin/AdminFinance.vue";
import AdminAccounts from "@/views/dormmart/Admin/AdminAccounts.vue";
import AdminSupport from "@/views/dormmart/Admin/AdminSupport.vue";
import AdminReviews from "@/views/dormmart/Admin/AdminReviews.vue";
import AdminPromotions from "@/views/dormmart/Admin/AdminPromotions.vue";
import AdminCombos from "@/views/dormmart/Admin/AdminCombosView.vue";
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
        component: AdminCombos,
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
