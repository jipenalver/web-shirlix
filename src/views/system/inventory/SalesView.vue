<script setup>
import NotAcceptableUI from '@/components/errors/NotAcceptableUI.vue'
import StocksSoldList from '@/components/system/inventory/sales/StocksSoldList.vue'
import StocksList from '@/components/system/inventory/sales/StocksList.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import SideNavigation from '@/components/layout/navigation/SideNavigation.vue'
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

// Utilize pre-defined vue functions
const { xs, mobile } = useDisplay()

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
      <v-container fluid>
        <div class="mt-16" v-if="xs">
          <NotAcceptableUI :is-show-back-btn="true"></NotAcceptableUI>
        </div>

        <v-row v-else>
          <v-col cols="12" sm="6" md="8" class="bg-surface-light">
            <StocksList></StocksList>
          </v-col>

          <v-col cols="12" sm="6" md="4" class="position-relative h-screen">
            <StocksSoldList></StocksSoldList>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
