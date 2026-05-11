import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "@/views/MainLayout.vue";
import EmployeeList from "@/views/EmployeeList.vue";
import DemoView from "@/views/DemoView.vue";
const routes = [
  {
    path: "/",
    name: "home",
    component: MainLayout,
    redirect: "/employees",
    children: [
      {
        path: "employees",
        name: "employeeList",
        component: EmployeeList
      },
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
