import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "@/views/MainLayout.vue";
import DemoView from "@/views/DemoView.vue";
import SalaryComposition from "@/feat/salarycomposition/SalaryComposition.vue";
const routes = [
  {
    path: "/",
    name: "home",
    component: MainLayout,
    redirect: "/salarycomposition",
    children: [
      {
        path: "demo",
        name: "demoView",
        component: DemoView
      },
      {
        path: "salarycomposition",
        name: "salaryComposition",
        component: SalaryComposition
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
