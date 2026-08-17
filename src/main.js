import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/styles/brand-colors.css";
import "./assets/styles/brand-icons.css";
import "./assets/styles/icon.css";
import "./assets/styles/utility.css";
import "./assets/styles/dormmart.css";

createApp(App)
    .use(router)
    .mount("#app");
