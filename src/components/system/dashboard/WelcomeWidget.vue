<script setup>
import { useAuthUserStore } from '@/stores/authUser'
import { useDisplay } from 'vuetify'

const props = defineProps(['theme'])

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()

// Use Pinia Store
const authStore = useAuthUserStore()
</script>

<template>
  <v-card :min-height="mdAndDown ? undefined : '370px'">
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
      <p class="ms-4 text-wrap">View Product Inventory Level and Other Admin Widgets.</p>
    </template>

    <v-divider class="my-3" thickness="2"></v-divider>

    <v-card-text>
      <v-row>
        <v-col cols="12" sm="4" class="d-flex align-center">
          <v-img
            :src="props.theme == 'light' ? '/images/logo-shop.png' : '/images/logo-shop-dark.png'"
            :width="mdAndDown ? '80%' : '100%'"
          ></v-img>
        </v-col>

        <v-col cols="12" sm="8">
          <h2 class="mb-5">
            Welcome Aboard,
            <span class="font-weight-black">
              {{ authStore.userData.firstname + ' ' + authStore.userData.lastname }}!
            </span>
          </h2>

          <p class="text-justify">
            Welcome to the Inventory Management System! Effortlessly manage your inventory from one
            place. Log in to access your account or register to get started. Here, you can track
            items, manage stock levels, and streamline your operations for greater efficiency. Thank
            you for choosing our system—we’re here to make inventory management simple and
            effective!
          </p>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
