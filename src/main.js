import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/styles/navbar.css";
import "@/assets/styles/sidebar.css";
import "@/assets/styles/formadd.css";
import "@/assets/styles/icon.css";
import "@/assets/styles/main.css";
import "@/assets/styles/table.css";
import "@/assets/styles/common.css";
import "@/assets/styles/event.css";
import "@/assets/styles/layout.css";




createApp(App)
    .use(router)
    .mount("#app");
