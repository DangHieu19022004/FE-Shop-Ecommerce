import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "@/views/MainLayout.vue";
import DemoView from "@/views/DemoView.vue";
const routes = [
  {
    path: "/",
    name: "home",
    component: MainLayout,
    redirect: "/demo",
    children: [
      {
        path: "demo",
        name: "demoView",
        component: DemoView
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
