// Auth
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
// Error
import ForbiddenView from '@/views/errors/ForbiddenView.vue'
import NotFoundView from '@/views/errors/NotFoundView.vue'
// Default
import DashboardView from '@/views/system/DashboardView.vue'
import AccountSettingsView from '@/views/system/AccountSettingsView.vue'
// Users
import BranchesView from '@/views/system/manage-users/BranchesView.vue'
import UserRolesView from '@/views/system/manage-users/UserRolesView.vue'
import UsersView from '@/views/system/manage-users/UsersView.vue'
// Product
import ProductsView from '@/views/system/manage-products/ProductsView.vue'
// Inventory
import StockInView from '@/views/system/inventory/StockInView.vue'
import StockSegregationView from '@/views/system/inventory/StockSegregationView.vue'
import SalesView from '@/views/system/inventory/SalesView.vue'
// Expenses
import ExpensesView from '@/views/system/manage-expenses/ExpensesView.vue'
// Reports
import StocksReportView from '@/views/system/reports/StocksReportView.vue'
import SalesReportView from '@/views/system/reports/SalesReportView.vue'
import SummaryReportView from '@/views/system/reports/SummaryReportView.vue'
import ExpensesReportView from '@/views/system/reports/ExpensesReportView.vue'

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
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: false }
  },

  // Default Pages
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, isDefault: true }
  },
  {
    path: '/account/settings',
    name: 'account-settings',
    component: AccountSettingsView,
    meta: { requiresAuth: true, isDefault: true }
  },

  // User Pages
  {
    path: '/manage/user/roles',
    name: 'manage-user-roles',
    component: UserRolesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/manage/users',
    name: 'manage-users',
    component: UsersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/manage/branches',
    name: 'manage-branches',
    component: BranchesView,
    meta: { requiresAuth: true }
  },

  // Products
  {
    path: '/products',
    name: 'products',
    component: ProductsView,
    meta: { requiresAuth: true }
  },

  // Inventory Pages
  {
    path: '/inventory/stockin',
    name: 'inventory-stockin',
    component: StockInView,
    meta: { requiresAuth: true }
  },
  {
    path: '/inventory/segregate',
    name: 'inventory-segregate',
    component: StockSegregationView,
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

  // Reports Pages
  {
    path: '/reports/stocks',
    name: 'reports-stocks',
    component: StocksReportView,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/sales',
    name: 'reports-sales',
    component: SalesReportView,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports/summary',
    name: 'reports-summary',
    component: SummaryReportView,
    meta: { requiresAuth: true }
  },
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
    component: ForbiddenView,
    meta: { isDefault: true }
  },
  {
    path: '/:catchAll(.*)',
    name: 'not-found',
    component: NotFoundView,
    meta: { isDefault: true }
  }
]
