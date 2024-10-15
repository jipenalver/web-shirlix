<script setup>
import UserRolesList from '@/components/system/manage-users/UserRolesList.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import SideNavigation from '@/components/layout/navigation/SideNavigation.vue'
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
        <v-card class="mb-5">
          <template #title>
            <span class="text-h6 font-weight-bold">
              <v-breadcrumbs :items="['User Management', 'User Roles']">
                <template #prepend>
                  <v-icon icon="mdi-tag-multiple" size="small" class="me-1"></v-icon>
                </template>
              </v-breadcrumbs>
            </span>
          </template>

          <template #subtitle>
            <p class="ms-4">
              A role grants access to specific pages and features, ensuring that admin users can
              access what they need based on their assigned role.
            </p>
          </template>
        </v-card>

        <UserRolesList></UserRolesList>
      </v-container>
    </template>
  </AppLayout>
</template>
