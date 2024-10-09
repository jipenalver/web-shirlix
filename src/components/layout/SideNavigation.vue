<script setup>
import { useDisplay } from 'vuetify'
import { ref, watch } from 'vue'

const props = defineProps(['isDrawerVisible'])

// Utilize predefined vue functions
const { mobile } = useDisplay()

// Load Variables
const isDrawerVisible = ref(props.isDrawerVisible)
watch(props, () => {
  isDrawerVisible.value = props.isDrawerVisible
})

// Main Navigation
const mainNav = [
  ['User Management', 'mdi-account-box-multiple'],
  ['Product Management', 'mdi-clipboard-list'],
  ['Inventory', 'mdi-invoice-list'],
  ['Expense Management', 'mdi-cash-register'],
  ['Reporting', 'mdi-file-chart']
]

// Sub Navigations
const menuItemsNav1 = [
  ['User Roles', 'mdi-tag-multiple', '', ''],
  ['Users Management', 'mdi-account-multiple', '', '']
]
const menuItemsNav2 = [['Product Information', 'mdi-information-box', 'Add & Manage Products', '']]
const menuItemsNav3 = [
  ['Stock In', 'mdi-tray-arrow-down', '', ''],
  ['Stock Out', 'mdi-tray-arrow-up', '', '']
]
const menuItemsNav4 = [['Expenses', 'mdi-cash-remove', 'Tally and Manage Expenses', '']]
const menuItemsNav5 = [
  ['Balance Sheet', 'mdi-scale-balance', '', ''],
  ['Gross Revenue & Net Profit', 'mdi-cash-100', '', ''],
  ['Sales', 'mdi-sale', '', ''],
  ['Expenses', 'mdi-cash-multiple', '', '']
]
</script>

<template>
  <v-navigation-drawer
    v-model="isDrawerVisible"
    :temporary="mobile"
    :permanent="!mobile"
    width="350"
  >
    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
        value="Dashboard"
      ></v-list-item>

      <v-divider></v-divider>

      <v-list-group :key="i" v-for="([title, icon], i) in mainNav">
        <template #activator="{ props }">
          <v-list-item v-bind="props" :prepend-icon="icon" :title="title"></v-list-item>
        </template>

        <template v-if="title === 'User Management'">
          <v-list-item
            v-for="([title, icon, subtitle, to], i) in menuItemsNav1"
            :key="i"
            :prepend-icon="icon"
            :title="title"
            :subtitle="subtitle ?? undefined"
            :to="to ?? undefined"
          ></v-list-item>
        </template>

        <template v-if="title === 'Product Management'">
          <v-list-item
            v-for="([title, icon, subtitle, to], i) in menuItemsNav2"
            :key="i"
            :prepend-icon="icon"
            :title="title"
            :subtitle="subtitle ?? undefined"
            :to="to ?? undefined"
          ></v-list-item>
        </template>

        <template v-if="title === 'Inventory'">
          <v-list-item
            v-for="([title, icon, subtitle, to], i) in menuItemsNav3"
            :key="i"
            :prepend-icon="icon"
            :title="title"
            :subtitle="subtitle ?? undefined"
            :to="to ?? undefined"
          ></v-list-item>
        </template>

        <template v-if="title === 'Expense Management'">
          <v-list-item
            v-for="([title, icon, subtitle, to], i) in menuItemsNav4"
            :key="i"
            :prepend-icon="icon"
            :title="title"
            :subtitle="subtitle ?? undefined"
            :to="to ?? undefined"
          ></v-list-item>
        </template>

        <template v-if="title === 'Reporting'">
          <v-list-item
            v-for="([title, icon, subtitle, to], i) in menuItemsNav5"
            :key="i"
            :prepend-icon="icon"
            :title="title"
            :subtitle="subtitle ?? undefined"
            :to="to ?? undefined"
          ></v-list-item>
        </template>
      </v-list-group>

      <v-divider></v-divider>

      <v-list-item
        prepend-icon="mdi-wrench"
        title="Account Settings"
        value="Account Settings"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
