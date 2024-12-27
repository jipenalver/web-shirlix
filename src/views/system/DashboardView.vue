<script setup>
import CodeGeneratorWidget from '@/components/system/dashboard/CodeGeneratorWidget.vue'
import SideNavigation from '@/components/layout/navigation/SideNavigation.vue'
import ProductsWidget from '@/components/system/dashboard/ProductsWidget.vue'
import WelcomeWidget from '@/components/system/dashboard/WelcomeWidget.vue'
import MapWidget from '@/components/system/dashboard/MapWidget.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAuthUserStore } from '@/stores/authUser'
import { useDisplay } from 'vuetify'
import { ref } from 'vue'

// Use Pinia Store
const authStore = useAuthUserStore()

// Utilize pre-defined vue functions
const { mobile } = useDisplay()

// Load Variables
const isSuperAdmin = authStore.userRole === 'Super Administrator'
const isDrawerVisible = ref(mobile.value ? false : true)
const theme = ref(localStorage.getItem('theme') ?? 'light')

// On Theme Update
const onThemeUpdate = (value) => {
  theme.value = value
}
</script>

<template>
  <AppLayout
    :is-with-app-bar-nav-icon="true"
    @is-drawer-visible="isDrawerVisible = !isDrawerVisible"
    @theme="onThemeUpdate"
  >
    <template #navigation>
      <SideNavigation :is-drawer-visible="isDrawerVisible"></SideNavigation>
    </template>

    <template #content>
      <v-container fluid>
        <v-row>
          <v-col cols="12" :md="isSuperAdmin ? 7 : false">
            <WelcomeWidget :theme="theme"></WelcomeWidget>
          </v-col>

          <v-col cols="12" md="5" v-if="isSuperAdmin">
            <CodeGeneratorWidget></CodeGeneratorWidget>
          </v-col>

          <v-col cols="12">
            <ProductsWidget v-if="authStore.userData.user_role"></ProductsWidget>
          </v-col>

          <v-col cols="12">
            <MapWidget></MapWidget>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
