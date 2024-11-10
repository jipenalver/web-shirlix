<script setup>
import CodeGeneratorWidget from '@/components/system/dashboard/CodeGeneratorWidget.vue'
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
        <v-row>
          <v-col cols="12">
            <WelcomeWidget></WelcomeWidget>
          </v-col>

          <v-col cols="12" md="8">
            <ProductsWidget></ProductsWidget>
          </v-col>

          <v-col cols="12" md="4">
            <v-row>
              <v-col cols="12">
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
