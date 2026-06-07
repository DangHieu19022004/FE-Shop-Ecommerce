import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "@/views/MainLayout.vue";
import DemoView from "@/views/DemoView.vue";
import SalaryComposition from "@/feat/salarycomposition/SalaryComposition.vue";
import SalaryCompositionSystem from "@/feat/salarycompositionsystems/SalaryCompositionSystem.vue";

/**
 * Khai báo route
 *
 * CREATED BY: TDHieu (08/06/2026)
 */
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
      },
      {
        path: "salarycomposition/salarycomposition-system",
        name: "salaryCompositionSystem",
        component: SalaryCompositionSystem
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
