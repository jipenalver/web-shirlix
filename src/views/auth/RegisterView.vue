<script setup>
import RegisterForm from '@/components/auth/RegisterForm.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useDisplay } from 'vuetify'
import { ref } from 'vue'

// Utilize pre-defined vue functions
const { mobile } = useDisplay()

// Load Variables
const theme = ref(localStorage.getItem('theme') ?? 'light')

// On Theme Update
const onThemeUpdate = (value) => {
  theme.value = value
}
</script>

<template>
  <AppLayout :is-with-app-bar-nav-icon="false" @theme="onThemeUpdate">
    <template #content>
      <v-container class="pa-0" fluid>
        <v-row dense>
          <v-col cols="12" lg="8" class="bg-surface-light h-screen pa-0" v-if="!mobile">
            <v-img
              class="mx-auto"
              :src="`/images/${theme === 'light' ? 'img-auth-light' : 'img-auth-dark'}.png`"
              cover
            ></v-img>
          </v-col>

          <v-col cols="12" lg="4" :class="mobile ? '' : 'pt-16'">
            <v-card class="mx-auto" elevation="0" max-width="600">
              <v-card-title class="text-center">
                <v-img
                  class="mx-auto"
                  src="/images/logo-shop.png"
                  :width="mobile ? '75%' : '65%'"
                ></v-img>

                <h3 class="font-weight-black mt-5">Registration</h3>
              </v-card-title>

              <v-card-text class="pt-4">
                <v-divider class="my-5"></v-divider>

                <RegisterForm></RegisterForm>

                <v-divider class="my-5"></v-divider>

                <h4 class="text-center">
                  Already have account?
                  <RouterLink class="text-red-darken-4 font-weight-black" to="/">
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
