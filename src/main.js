import { createApp } from "vue";
import App from "./App.vue";
import DMBadge from "./components/base/DMBadge.vue";
import router from "./router";
import i18nCommon from "./i18n/i18nCommon";
import "./assets/styles/brand-colors.scss";
import "./assets/styles/brand-icons.scss";
import "./assets/styles/utility.scss";
import "./assets/styles/dormmart.scss";
import "./assets/styles/cart-animation.scss";
import "./assets/styles/screens/combo.scss";
import "./assets/styles/screens/product-detail.scss";

const AppInstance = createApp(App);
AppInstance.component("DMBadge", DMBadge);
AppInstance.provide("i18nCommon", i18nCommon);
AppInstance.use(router);
AppInstance.mount("#app");
