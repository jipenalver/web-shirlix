<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import UsersFormDialog from './UsersFormDialog.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useDate } from 'vuetify'
import { useUsersStore } from '@/stores/users'
import { onMounted, ref } from 'vue'
import { formActionDefault } from '@/utils/supabase'
import { useUserRolesStore } from '@/stores/userRoles'

// Utilize
const date = useDate()

// Table Headers
const tableHeaders = [
  {
    title: 'Email',
    key: 'email',
    sortable: false,
    align: 'start'
  },
  {
    title: 'Fullname',
    key: 'lastname',
    sortable: false,
    align: 'start'
  },
  {
    title: 'Phone',
    key: 'phone',
    sortable: false,
    align: 'start'
  },
  {
    title: 'Role',
    key: 'user_role',
    sortable: false,
    align: 'start'
  },
  {
    title: 'Registered Date',
    key: 'created_at',
    sortable: false,
    align: 'end'
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    align: 'center'
  }
]

// Use Pinia Store
const userRolesStore = useUserRolesStore()
const usersStore = useUsersStore()

// Load Variables
const tableOptions = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  isLoading: false
})
const isDialogVisible = ref(false)
const isConfirmDeleteDialog = ref(false)
const itemData = ref(null)
const deleteId = ref('')
const formAction = ref({
  ...formActionDefault
})

// Trigger Update Btn
const onUpdate = (item) => {
  const { id, email, phone, user_metadata } = item

  itemData.value = { id, email, phone, ...user_metadata }
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

  const { error } = await usersStore.deleteUser(deleteId.value)

  // Turn off processing
  formAction.value.formProcess = false

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    return
  }

  // Add Success Message
  formAction.value.formSuccessMessage = 'Successfully Deleted User.'

  // Retrieve Users
  await usersStore.getUsers(tableOptions)
}

// Load Tables Data
const loadItems = async ({ page, itemsPerPage, sortBy }) => {
  // Trigger Loading
  tableOptions.value.isLoading = true

  // Load Users
  await usersStore.getUsers({ page, itemsPerPage, sortBy })

  // Trigger Loading
  tableOptions.value.isLoading = false
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
    <v-col cols="12">
      <!-- eslint-disable vue/valid-v-slot -->
      <v-data-table-server
        v-model:items-per-page="tableOptions.itemsPerPage"
        v-model:page="tableOptions.page"
        v-model:sort-by="tableOptions.sortBy"
        :loading="tableOptions.isLoading"
        :headers="tableHeaders"
        :items="usersStore.usersTable"
        :items-length="usersStore.usersTable.length"
        @update:options="loadItems"
      >
        <template #top>
          <v-row dense>
            <v-spacer></v-spacer>

            <v-col cols="12" md="2">
              <v-btn
                class="my-1"
                prepend-icon="mdi-account-plus"
                color="deep-orange-lighten-1"
                block
                @click="onAdd"
              >
                Add User
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-5"></v-divider>
        </template>

        <template #item.lastname="{ item }">
          {{ item.user_metadata.lastname }}, {{ item.user_metadata.firstname }}
        </template>

        <template #item.phone="{ item }">
          {{ item.user_metadata.phone }}
        </template>

        <template #item.user_role="{ item }">
          {{ item.user_metadata.user_role }}
        </template>

        <template #item.created_at="{ item }">
          {{ date.format(item.created_at, 'fullDateTime') }}
        </template>

        <template #item.actions="{ item }">
          <v-btn variant="text" density="comfortable" @click="onUpdate(item)">
            <v-icon icon="mdi-pencil" size="large"></v-icon>
            <v-tooltip activator="parent" location="top">Edit User</v-tooltip>
          </v-btn>

          <v-btn variant="text" density="comfortable" @click="onDelete(item.id)">
            <v-icon icon="mdi-trash-can" color="deep-orange-lighten-1"></v-icon>
            <v-tooltip activator="parent" location="top">Delete User</v-tooltip>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>

  <UsersFormDialog
    v-model:is-dialog-visible="isDialogVisible"
    :item-data="itemData"
    :table-options="tableOptions"
  ></UsersFormDialog>

  <ConfirmDialog
    v-model:is-dialog-visible="isConfirmDeleteDialog"
    title="Confirm Delete"
    text="Are you sure you want to delete user?"
    @confirm="onConfirmDelete"
  ></ConfirmDialog>
</template>
