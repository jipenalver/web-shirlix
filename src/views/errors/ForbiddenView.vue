<script setup>
import { isAuthenticated } from '@/utils/supabase'
import AppLayout from '@/components/layout/AppLayout.vue'
import SideNavigation from '@/components/layout/SideNavigation.vue'
import { onMounted, ref } from 'vue'

// Load Variables
const isLoggedIn = ref(false)
const isDrawerVisible = ref(true)

// Get Authentication status from supabase
const getLoggedStatus = async () => {
  isLoggedIn.value = await isAuthenticated()
}

// Load Functions during component rendering
onMounted(() => {
  getLoggedStatus()
})
</script>

<template>
  <AppLayout
    :is-with-app-bar-nav-icon="isLoggedIn"
    @is-drawer-visible="isDrawerVisible = !isDrawerVisible"
  >
    <template #navigation v-if="isLoggedIn">
      <SideNavigation :is-drawer-visible="isDrawerVisible"></SideNavigation>
    </template>

    <template #content>
      <v-container>
        <v-row>
          <v-col class="mx-auto mt-16 text-center" cols="12" lg="4">
            <h1 class="text-h1 font-weight-black text-deep-orange-lighten-1">403</h1>
            <h2 class="text-h2 font-weight-black mb-2">Forbidden</h2>

            <p class="text-subtitle-1 font-weight-bold mb-4">
              You dont have permission to access this page.
            </p>

            <v-btn class="mt-2" color="deep-orange-lighten-1" prepend-icon="mdi-home" to="/">
              Back to {{ isLoggedIn ? 'Dashboard' : 'Homepage' }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
