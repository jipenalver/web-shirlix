<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
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
        <v-row>
          <v-col cols="12" lg="8" class="bg-surface-light h-screen pa-0" v-if="!mobile">
            <v-img
              class="mx-auto"
              :src="`/images/${theme === 'light' ? 'img-auth-light' : 'img-auth-dark'}.png`"
              cover
            ></v-img>
          </v-col>

          <v-col cols="12" lg="4" :class="mobile ? '' : 'pt-16'">
            <v-card class="mx-auto mt-10" elevation="0" max-width="600">
              <v-card-title class="text-center">
                <v-img
                  class="mx-auto"
                  src="/images/logo-shop.png"
                  :width="mobile ? '75%' : '65%'"
                ></v-img>

                <h3 class="font-weight-black mt-5">Welcome to Shirlix!</h3>
              </v-card-title>

              <v-card-text class="pt-4">
                <v-divider class="my-5"></v-divider>

                <LoginForm></LoginForm>

                <v-divider class="my-5"></v-divider>

                <h4 class="text-center" v-if="false">
                  Don't have account?
                  <RouterLink class="text-red-darken-4 font-weight-black" to="/register">
                    Click here to Register
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
