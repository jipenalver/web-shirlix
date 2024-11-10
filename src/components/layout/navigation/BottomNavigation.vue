<script setup>
const props = defineProps(['theme'])
</script>

<template>
  <v-bottom-navigation
    :bg-color="props.theme === 'light' ? 'red-lighten-2' : 'red-darken-4'"
    active
  >
    <v-btn>
      <v-icon>mdi-view-dashboard</v-icon>
      Dashboard
    </v-btn>

    <v-btn>
      <v-icon>mdi-tray-arrow-up</v-icon>
      Sales
    </v-btn>

    <v-btn>
      <v-icon>mdi-account-credit-card</v-icon>
      Payments
    </v-btn>

    <v-btn>
      <v-icon>mdi-sale</v-icon>
      Sales Report
    </v-btn>
  </v-bottom-navigation>
</template>
