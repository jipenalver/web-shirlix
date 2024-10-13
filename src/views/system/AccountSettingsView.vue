<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import SideNavigation from '@/components/layout/SideNavigation.vue'
import PictureForm from '@/components/system/account-settings/PictureForm.vue'
import ProfileForm from '@/components/system/account-settings/ProfileForm.vue'
import { useAuthUserStore } from '@/stores/authUser'
import { ref } from 'vue'

// Utilize pre-defined vue functions
const authStore = useAuthUserStore()

// Load Variables
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
                  width="50%"
                  class="mx-auto rounded-circle"
                  color="deep-orange-lighten-1"
                  aspect-ratio="1"
                  :src="authStore.userData.image_url || '/images/img-profile.png'"
                  alt="Profile Picture"
                  cover
                >
                </v-img>

                <h3 class="d-flex align-center justify-center mt-5">
                  <v-icon class="me-2" icon="mdi-account-badge"> </v-icon>
                  {{ authStore.userRole }}
                </h3>

                <v-divider class="my-5"></v-divider>

                <div class="text-center">
                  <h4 class="my-2">
                    <b>Fullname:</b>
                    {{ authStore.userData.firstname + ' ' + authStore.userData.lastname }}
                  </h4>
                  <h4 class="my-2"><b>Email:</b> {{ authStore.userData.email }}</h4>
                  <h4 class="my-2"><b>Contact No.:</b> {{ authStore.userData.phone }}</h4>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" lg="8">
            <v-card class="mb-5" title="Profile Picture">
              <v-card-text>
                <PictureForm></PictureForm>
              </v-card-text>
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
