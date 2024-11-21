<script setup>
import StocksSoldList from '@/components/system/inventory/sales/StocksSoldList.vue'
import StocksList from '@/components/system/inventory/sales/StocksList.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import SideNavigation from '@/components/layout/navigation/SideNavigation.vue'
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

// Utilize pre-defined vue functions
const { mobile } = useDisplay()

// Load Variables
const isDrawerVisible = ref(mobile.value ? false : true)
const listData = ref([])

// Product Data and Qty
const onSoldQty = (itemData) => {
  listData.value.push(itemData)
}
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
        <v-row>
          <v-col cols="12" sm="8" class="bg-surface-light">
            <StocksList @quantity="onSoldQty"></StocksList>
          </v-col>

          <v-col cols="12" sm="4" class="position-relative h-screen">
            <StocksSoldList :list-data="listData"></StocksSoldList>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
