<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container fluid>
        <v-row :class="mobile ? 'd-flex justify-center' : ''">
          <v-col cols="12" lg="8" class="bg-surface-light h-screen" v-if="!mobile"></v-col>
          <v-col cols="12" lg="4" :class="mobile ? '' : 'pt-16'">
            <v-card class="mx-auto" elevation="0" max-width="600">
              <v-card-title class="text-center">
                <v-img
                  class="mx-auto"
                  src="/images/logo-shop.png"
                  :width="mobile ? '75%' : '25%'"
                ></v-img>
                <h3 class="font-weight-black">Shirlix Meatshop</h3>
                <p class="font-weight-bold">Registration</p>
              </v-card-title>

              <v-card-text class="pt-4">
                <v-divider class="my-5"></v-divider>

                <RegisterForm></RegisterForm>

                <v-divider class="my-5"></v-divider>

                <h4 class="text-center">
                  Already have account?
                  <RouterLink class="text-deep-orange-lighten-1 font-weight-black" to="/">
                    Click here to Login
                  </RouterLink>
                </h4>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
