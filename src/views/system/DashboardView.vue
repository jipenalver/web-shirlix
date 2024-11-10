<script setup>
import MapWidget from '@/components/system/dashboard/MapWidget.vue'
import WelcomeWidget from '@/components/system/dashboard/WelcomeWidget.vue'
import ProductsWidget from '@/components/system/dashboard/ProductsWidget.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import SideNavigation from '@/components/layout/navigation/SideNavigation.vue'
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

// Utilize pre-defined vue functions
const { mobile } = useDisplay()

// Load Variables
const isDrawerVisible = ref(mobile.value ? false : true)
</script>

<template>
  <AppLayout
    :is-with-app-bar-nav-icon="true"
    @is-drawer-visible="isDrawerVisible = !isDrawerVisible"
  >
    <template #navigation>
      <SideNavigation :is-drawer-visible="isDrawerVisible"></SideNavigation>
    </template>

    <template #content>
      <v-container>
        <v-card class="mb-5">
          <template #title>
            <span class="text-h6 font-weight-bold">
              <v-breadcrumbs :items="['System', 'Dashboard']">
                <template #prepend>
                  <v-icon icon="mdi-view-dashboard" size="small" class="me-1"></v-icon>
                </template>
              </v-breadcrumbs>
            </span>
          </template>

          <template #subtitle>
            <p class="ms-4 text-wrap"></p>
          </template>
        </v-card>

        <v-row>
          <v-col cols="12">
            <WelcomeWidget></WelcomeWidget>
          </v-col>

          <v-col cols="12" md="8">
            <ProductsWidget></ProductsWidget>
          </v-col>

          <v-col cols="12" md="4">
            <MapWidget></MapWidget>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
