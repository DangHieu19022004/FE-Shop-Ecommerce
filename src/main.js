import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import i18nCommon from "./i18n/i18nCommon";
import "./assets/styles/brand-colors.css";
import "./assets/styles/brand-icons.css";
import "./assets/styles/icon.css";
import "./assets/styles/utility.css";
import "./assets/styles/dormmart.css";

const AppInstance = createApp(App);
AppInstance.provide("i18nCommon", i18nCommon);
AppInstance.use(router);
AppInstance.mount("#app");
