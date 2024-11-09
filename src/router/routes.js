import LoginView from '@/views/auth/LoginView.vue'
// import RegisterView from '@/views/auth/RegisterView.vue'
import DashboardView from '@/views/system/DashboardView.vue'
import ForbiddenView from '@/views/errors/ForbiddenView.vue'
import NotFoundView from '@/views/errors/NotFoundView.vue'
import AccountSettingsView from '@/views/system/AccountSettingsView.vue'
import UserRolesView from '@/views/system/manage-users/UserRolesView.vue'
import UsersView from '@/views/system/manage-users/UsersView.vue'
import BranchesView from '@/views/system/manage-users/BranchesView.vue'
import ExpensesView from '@/views/system/manage-expenses/ExpensesView.vue'
import ExpensesReportView from '@/views/system/reports/ExpensesReportView.vue'
import ProductsView from '@/views/system/manage-products/ProductsView.vue'
import StockInView from '@/views/system/inventory/StockInView.vue'
import StockWeightView from '@/views/system/inventory/StockWeightView.vue'
import SalesView from '@/views/system/inventory/SalesView.vue'

// 👉 Routes
export const routes = [
  // Auth Pages
  {
    path: '/',
    name: 'home'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  // {
  //   path: '/register',
  //   name: 'register',
  //   component: RegisterView,
  //   meta: { requiresAuth: false }
  // },

  // System Pages
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/account/settings',
    name: 'account-settings',
    component: AccountSettingsView,
    meta: { requiresAuth: true }
  },

  // Admin Pages
  {
    path: '/manage/user/roles',
    name: 'manage-user-roles',
    component: UserRolesView,
    meta: { requiresAuth: true, requiresAccess: true }
  },
  {
    path: '/manage/users',
    name: 'manage-users',
    component: UsersView,
    meta: { requiresAuth: true, requiresAccess: true }
  },
  {
    path: '/manage/branches',
    name: 'manage-branches',
    component: BranchesView,
    meta: { requiresAuth: true, requiresAccess: true }
  },

  // Products
  {
    path: '/products',
    name: 'products',
    component: ProductsView,
    meta: { requiresAuth: true }
  },

  // Inventory
  {
    path: '/inventory/stockin',
    name: 'inventory-stockin',
    component: StockInView,
    meta: { requiresAuth: true }
  },
  {
    path: '/inventory/weight',
    name: 'inventory-weight',
    component: StockWeightView,
    meta: { requiresAuth: true }
  },
  {
    path: '/inventory/sales',
    name: 'inventory-sales',
    component: SalesView,
    meta: { requiresAuth: true }
  },

  // Expenses
  {
    path: '/expenses',
    name: 'expenses',
    component: ExpensesView,
    meta: { requiresAuth: true }
  },

  // Reports Page
  {
    path: '/reports/expenses',
    name: 'reports-expenses',
    component: ExpensesReportView,
    meta: { requiresAuth: true }
  },

  // Errors Pages
  {
    path: '/forbidden',
    name: 'forbidden',
    component: ForbiddenView
  },
  {
    path: '/:catchAll(.*)',
    name: 'not-found',
    component: NotFoundView
  }
]
