import { getUserInformation, isAuthenticated } from '@/utils/supabase'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import DashboardView from '@/views/system/DashboardView.vue'
import ForbiddenView from '@/views/errors/ForbiddenView.vue'
import NotFoundView from '@/views/errors/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth Pages
    {
      path: '/',
      name: 'home'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },

    // System Pages
    {
      path: '/system/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    // Add More Pages Here
    // {
    //   path: '/system/sample-page',
    //   name: 'sample-page',
    //   component: sample-page
    // },

    // Errors Pages
    {
      path: '/forbidden',
      name: 'forbidden',
      component: ForbiddenView
    },
    {
      path: '/not-found',
      name: 'not-found',
      component: NotFoundView
    }
  ]
})

router.beforeEach(async (to) => {
  const isLoggedIn = await isAuthenticated()

  // Redirect to appropriate page if accessing home route
  if (to.name === 'home') {
    return isLoggedIn ? { name: 'dashboard' } : { name: 'login' }
  }

  // Check if the user is logged in
  if (isLoggedIn && (to.name === 'login' || to.name === 'register')) {
    // redirect the user to the dashboard page
    return { name: 'dashboard' }
  }

  // Check if the user is logged in
  if (isLoggedIn) {
    // Retrieve information
    const userMetadata = await getUserInformation()
    // Get the user role
    const isAdmin = userMetadata.is_admin
    // remove this comment if not need; Boolean Approach
    // const isCashier = userMetadata.is_cashier
    // remove this comment if not need; String Approach
    // const isCashier = userMetadata.role === 'Cashier'

    // Check if the user not admin
    if (!isAdmin) {
      // Check if the user is going to forbidden pages
      if (to.name.startsWith('system/users')) {
        return { name: 'forbidden' }
      }
    }
    // Add conditions here if needed
    // if(isCashier) {

    // }
  }

  // If not logged in and going to system pages
  if (!isLoggedIn && to.path.startsWith('/system')) {
    // redirect the user to the login page
    return { name: 'login' }
  }

  // Redirect to 404 Not Found if the route does not exist
  if (router.resolve(to).matched.length === 0) {
    return { name: 'not-found' }
  }
})

export default router
