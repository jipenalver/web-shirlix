<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import BranchesFormDialog from './BranchesFormDialog.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useDate } from 'vuetify'
import { useBranchesStore } from '@/stores/branches'
import { ref } from 'vue'
import { formActionDefault } from '@/utils/supabase'

// Utilize
const date = useDate()

// Table Headers
const tableHeaders = [
  {
    title: 'Name',
    key: 'name',
    sortable: false,
    align: 'start'
  },
  {
    title: 'Address',
    key: 'address',
    sortable: false,
    align: 'start'
  },
  {
    title: 'Added Date',
    key: 'created_at',
    sortable: false,
    align: 'center'
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    align: 'center'
  }
]

// Use Pinia Store
const branchesStore = useBranchesStore()

// Load Variables
const tableOptions = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  isLoading: false
})
const tableFilters = ref({
  search: ''
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

  const { error } = await branchesStore.deleteBranch(deleteId.value)

  // Turn off processing
  formAction.value.formProcess = false

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    return
  }

  // Add Success Message
  formAction.value.formSuccessMessage = 'Successfully Deleted Branch.'

  // Retrieve Data
  await branchesStore.getBranches(tableOptions.value, tableFilters.value)
}

// Load Tables Data
const loadItems = async ({ page, itemsPerPage, sortBy }) => {
  // Trigger Loading
  tableOptions.value.isLoading = true

  await branchesStore.getBranches({ page, itemsPerPage, sortBy }, tableFilters.value)

  // Trigger Loading
  tableOptions.value.isLoading = false
}
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
        :items="branchesStore.branchesTable"
        :items-length="branchesStore.branchesTable.length"
        @update:options="loadItems"
      >
        <template #top>
          <v-row dense>
            <v-spacer></v-spacer>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="tableFilters.search"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                placeholder="Search"
                clearable
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="2">
              <v-btn
                class="my-1"
                prepend-icon="mdi-account-plus"
                color="deep-orange-lighten-1"
                block
                @click="onAdd"
              >
                Add Branch
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-5"></v-divider>
        </template>

        <template #item.lastname="{ item }">
          <span class="font-weight-bold">
            {{ item.user_metadata.lastname }}, {{ item.user_metadata.firstname }}
          </span>
        </template>

        <template #item.phone="{ item }">
          {{ item.user_metadata.phone }}
        </template>

        <template #item.user_role="{ item }">
          {{ item.user_metadata.user_role }}
        </template>

        <template #item.created_at="{ item }">
          <span class="font-weight-bold">
            {{ date.format(item.created_at, 'fullDateTime') }}
          </span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center justify-center">
            <v-btn variant="text" density="comfortable" @click="onUpdate(item)" icon>
              <v-icon icon="mdi-pencil" size="large"></v-icon>
              <v-tooltip activator="parent" location="top">Edit Branch</v-tooltip>
            </v-btn>

            <v-btn
              variant="text"
              density="comfortable"
              :disabled="item.user_metadata.is_admin"
              @click="onDelete(item.id)"
              icon
            >
              <v-icon icon="mdi-trash-can" color="deep-orange-lighten-1"></v-icon>
              <v-tooltip activator="parent" location="top">Delete Branch</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>

  <BranchesFormDialog
    v-model:is-dialog-visible="isDialogVisible"
    :item-data="itemData"
    :table-options="tableOptions"
  ></BranchesFormDialog>

  <ConfirmDialog
    v-model:is-dialog-visible="isConfirmDeleteDialog"
    title="Confirm Delete"
    text="Are you sure you want to delete branch?"
    @confirm="onConfirmDelete"
  ></ConfirmDialog>
</template>
