<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useUserRolesStore } from '@/stores/userRoles'
import UserRolesFormDialog from './UserRolesFormDialog.vue'
import { onMounted, ref } from 'vue'
import { formActionDefault } from '@/utils/supabase'

// Use Pinia Store
const userRolesStore = useUserRolesStore()

// Load Variables
const isDialogVisible = ref(false)
const isConfirmDeleteDialog = ref(false)
const itemData = ref(null)
const deleteId = ref('')
const formAction = ref({
  ...formActionDefault
})

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

// Trigger Delete Btn
const onDelete = (id) => {
  deleteId.value = id
  isConfirmDeleteDialog.value = true
}

// Confirm Delete
const onConfirmDelete = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  const { error } = await userRolesStore.deleteUserRole(deleteId.value)

  // Turn off processing
  formAction.value.formProcess = false

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    return
  }

  // Add Success Message
  formAction.value.formSuccessMessage = 'Successfully Deleted User Role.'

  // Retrieve User Roles
  await userRolesStore.getUserRoles()
}

// Load Functions during component rendering
onMounted(async () => {
  if (userRolesStore.userRoles.length == 0) await userRolesStore.getUserRoles()
})
</script>

<template>
  <AlertNotification
    :form-success-message="formAction.formSuccessMessage"
    :form-error-message="formAction.formErrorMessage"
  ></AlertNotification>

  <v-row>
    <v-col cols="12" sm="4" v-for="item in userRolesStore.userRoles" :key="item.id">
      <v-card>
        <v-card-title class="mt-3 font-weight-bold"> {{ item.user_role }} </v-card-title>
        <v-card-text class="d-flex align-center justify-space-between">
          <v-spacer></v-spacer>

          <div class="d-flex flex-wrap ga-2">
            <v-btn variant="text" density="comfortable" @click="onUpdate(item)" icon>
              <v-icon icon="mdi-tag-edit"></v-icon>
              <v-tooltip activator="parent" location="top">Edit Role</v-tooltip>
            </v-btn>
            <v-btn
              variant="text"
              density="comfortable"
              @click="onDelete(item.id)"
              :disabled="item.pages.length != 1"
              icon
            >
              <v-icon icon="mdi-tag-remove" color="red-darken-4"> </v-icon>
              <v-tooltip activator="parent" location="top">Delete Role</v-tooltip>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="4">
      <v-card>
        <v-card-title class="mt-3 d-flex justify-end">
          <v-btn prepend-icon="mdi-tag-plus" color="red-darken-4" @click="onAdd"> Add Role </v-btn>
        </v-card-title>
        <v-card-text class="mt-2 mb-1 text-end"> Add Role if it doesn't exist. </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <UserRolesFormDialog
    v-model:is-dialog-visible="isDialogVisible"
    :item-data="itemData"
  ></UserRolesFormDialog>

  <ConfirmDialog
    v-model:is-dialog-visible="isConfirmDeleteDialog"
    title="Confirm Delete"
    text="Are you sure you want to delete user role?"
    @confirm="onConfirmDelete"
  ></ConfirmDialog>
</template>
