<script setup>
import CodeGeneratorWidget from '@/components/system/dashboard/CodeGeneratorWidget.vue'
import MapWidget from '@/components/system/dashboard/MapWidget.vue'
import WelcomeWidget from '@/components/system/dashboard/WelcomeWidget.vue'
import ProductsWidget from '@/components/system/dashboard/ProductsWidget.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import SideNavigation from '@/components/layout/navigation/SideNavigation.vue'
import { useAuthUserStore } from '@/stores/authUser'
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

// Use Pinia Store
const authStore = useAuthUserStore()

// Utilize pre-defined vue functions
const { smAndUp, mobile } = useDisplay()

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
      <v-container>
        <v-row>
          <v-col cols="12">
            <WelcomeWidget :theme="theme"></WelcomeWidget>
          </v-col>

          <v-col cols="12" md="8" v-if="smAndUp">
            <ProductsWidget :theme="theme"></ProductsWidget>
          </v-col>

          <v-col cols="12" md="4">
            <v-row>
              <v-col cols="12" v-if="isSuperAdmin">
                <CodeGeneratorWidget></CodeGeneratorWidget>
              </v-col>

              <v-col cols="12">
                <MapWidget></MapWidget>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
