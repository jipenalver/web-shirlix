<script setup>
import { useUserRolesStore } from '@/stores/userRoles'
import UserRolesFormDialog from './UserRolesFormDialog.vue'
import { onMounted, ref } from 'vue'

// Use Pinia Store
const userRolesStore = useUserRolesStore()

// Load Variables
const isDialogVisible = ref(false)
const itemData = ref(null)

// Trigger Update Btn
const onUpdate = (item) => {
  itemData.value = item
  isDialogVisible.value = true
}

// Trigger Add Btn
const onAdd = () => {
  itemData.value = null
  isDialogVisible.value = true
}

// Load Functions during component rendering
onMounted(() => {
  if (!userRolesStore.userRoles) {
    userRolesStore.getUserRoles()
  }
})
</script>

<template>
  <v-row>
    <v-col cols="12" md="4" v-for="item in userRolesStore.userRoles" :key="item.id">
      <v-card>
        <v-card-title class="mt-3 font-weight-bold"> {{ item.user_role }} </v-card-title>
        <v-card-text class="d-flex align-center justify-space-between">
          0 Total User(s)

          <div class="d-flex flex-wrap ga-2">
            <v-btn icon color="deep-orange-lighten-1" density="comfortable" @click="onUpdate(item)">
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
          <v-btn prepend-icon="mdi-tag-plus" color="deep-orange-lighten-1" @click="onAdd">
            Add Role
          </v-btn>
        </v-card-title>
        <v-card-text class="mt-2 mb-1 text-end"> Add Role if it doesn't exist. </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <UserRolesFormDialog
    v-model:is-dialog-visible="isDialogVisible"
    :item-data="itemData"
  ></UserRolesFormDialog>
</template>
