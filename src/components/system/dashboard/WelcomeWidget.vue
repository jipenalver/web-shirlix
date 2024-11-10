<script setup>
import { useAuthUserStore } from '@/stores/authUser'
import { useDisplay } from 'vuetify'

// Use Pinia Store
const authStore = useAuthUserStore()

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()
</script>

<template>
  <v-card>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="4" :class="mdAndDown ? 'd-flex align-center' : ''">
          <v-img
            :class="!mdAndDown ? 'mx-auto' : ''"
            src="/images/logo-shop.png"
            :width="mdAndDown ? '80%' : '60%'"
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
