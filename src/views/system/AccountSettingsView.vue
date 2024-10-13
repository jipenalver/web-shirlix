<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import SideNavigation from '@/components/layout/SideNavigation.vue'
import ProfileForm from '@/components/system/account-settings/ProfileForm.vue'
import { ref } from 'vue'

const isDrawerVisible = ref(true)
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
          <v-col cols="12" lg="4">
            <v-card>
              <v-card-text>
                <v-img
                  class="mx-auto rounded-circle"
                  color="deep-orange-lighten-1"
                  width="50%"
                  src="/images/img-profile.png"
                >
                </v-img>

                <h3 class="d-flex align-center justify-center mt-5">
                  <v-icon class="me-2" icon="mdi-account"> </v-icon>
                  Administrator
                </h3>

                <v-divider class="my-5"></v-divider>

                <div class="text-center">
                  <h4 class="my-2"><b>Fullname:</b> John Doe</h4>
                  <h4 class="my-2"><b>Email:</b></h4>
                  <h4 class="my-2"><b>Contact No.:</b></h4>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" lg="8">
            <v-card class="mb-5" title="Profile Picture">
              <v-card-text> </v-card-text>
            </v-card>

            <v-card class="mb-5" title="Profile Information">
              <v-card-text>
                <ProfileForm></ProfileForm>
              </v-card-text>
            </v-card>

            <v-card class="mb-5" title="Change Password">
              <v-card-text> </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
