<script setup>
import { useAuthUserStore } from '@/stores/authUser'

const props = defineProps(['theme'])

// Use Pinia Store
const authStore = useAuthUserStore()

// Filter pages base on role
const onFilterPages = (path) => {
  if (authStore.userRole === 'Super Administrator') return true

  if (authStore.authPages.includes(path)) return true

  return false
}
</script>

<template>
  <v-bottom-navigation
    :bg-color="props.theme === 'light' ? 'red-lighten-2' : 'red-darken-4'"
    grow
    active
  >
    <v-btn to="/dashboard">
      <v-icon>mdi-view-dashboard</v-icon>
      Dashboard
    </v-btn>

    <v-btn v-if="onFilterPages('/inventory/sales')" to="/inventory/sales">
      <v-icon>mdi-cart</v-icon>
      Check Out
    </v-btn>

    <v-btn v-if="onFilterPages('/inventory/stockin')" to="/inventory/stockin">
      <v-icon>mdi-tray-arrow-down</v-icon>
      Stock In
    </v-btn>

    <v-btn v-if="onFilterPages('/inventory/segregate')" to="/inventory/segregate">
      <v-icon>mdi-tray-full</v-icon>
      Stock Segregation
    </v-btn>
  </v-bottom-navigation>
</template>
