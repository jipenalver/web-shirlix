<script setup>
import UserRolesFormDialog from './UserRolesFormDialog.vue'
import { ref } from 'vue'

const isDialogVisible = ref(false)
</script>

<template>
  <v-row>
    <v-col cols="12" md="4">
      <v-card>
        <v-card-title class="mt-3 font-weight-bold"> Administrator </v-card-title>
        <v-card-text class="d-flex align-center justify-space-between">
          0 Total User(s)

          <div class="d-flex flex-wrap ga-2">
            <v-btn icon color="deep-orange-lighten-1" density="comfortable">
              <v-icon icon="mdi-tag-edit"></v-icon>
              <v-tooltip activator="parent" location="top">Edit Role</v-tooltip>
            </v-btn>
            <v-btn icon color="deep-orange-lighten-1" density="comfortable">
              <v-icon icon="mdi-tag-remove"> </v-icon>
              <v-tooltip activator="parent" location="top">Delete Role</v-tooltip>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="4">
      <v-card>
        <v-card-title class="mt-3 d-flex justify-end">
          <v-btn
            prepend-icon="mdi-tag-plus"
            color="deep-orange-lighten-1"
            @click="isDialogVisible = true"
          >
            Add Role
          </v-btn>
        </v-card-title>
        <v-card-text class="mt-2 mb-1 text-end"> Add Role if it doesn't exist. </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <UserRolesFormDialog v-model:is-dialog-visible="isDialogVisible"></UserRolesFormDialog>
</template>
