<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import ExpensesFormDialog from './ExpensesFormDialog.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { tableHeaders } from './expensesTableUtils'
import { formActionDefault } from '@/utils/supabase'
import { useBranchesStore } from '@/stores/branches'
import { useExpensesStore } from '@/stores/expenses'
import { useDate } from 'vuetify'
import { onMounted, ref } from 'vue'

// Utilize pre-defined vue functions
const date = useDate()

// Use Pinia Store
const branchesStore = useBranchesStore()
const expensesStore = useExpensesStore()

// Load Variables
const tableOptions = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
  isLoading: false
})
const tableFilters = ref({
  search: '',
  branch_id: null,
  spent_at: [new Date()]
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

  const { error } = await expensesStore.deleteExpenditure(deleteId.value)

  // Turn off processing
  formAction.value.formProcess = false

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    return
  }

  // Add Success Message
  formAction.value.formSuccessMessage = 'Successfully Deleted Expenditue.'

  // Retrieve Data
  onLoadItems(tableOptions.value, tableFilters.value)
}

// Retrieve Data based on Date
const onFilterDate = (isCleared = false) => {
  if (isCleared) tableFilters.value.spent_at = null

  onLoadItems(tableOptions.value, tableFilters.value)
}

// Retrieve Data based on Filter
const onFilterItems = () => {
  onLoadItems(tableOptions.value, tableFilters.value)
}

// Retrieve Data based on Search
const onSearchItems = () => {
  if (
    tableFilters.value.search?.length >= 3 ||
    tableFilters.value.search?.length == 0 ||
    tableFilters.value.search === null
  )
    onLoadItems(tableOptions.value, tableFilters.value)
}

// Load Tables Data
const onLoadItems = async ({ page, itemsPerPage, sortBy }) => {
  // Trigger Loading
  tableOptions.value.isLoading = true

  await expensesStore.getExpensesTable({ page, itemsPerPage, sortBy }, tableFilters.value)

  // Trigger Loading
  tableOptions.value.isLoading = false
}

// Load Functions during component rendering
onMounted(async () => {
  if (branchesStore.branches.length == 0) await branchesStore.getBranches()
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
        :items="expensesStore.expensesTable"
        :items-length="expensesStore.expensesTable.length"
        @update:options="onLoadItems"
      >
        <template #top>
          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="tableFilters.branch_id"
                :items="branchesStore.branches"
                density="compact"
                label="Branch"
                item-title="name"
                item-value="id"
                clearable
                @update:model-value="onFilterItems"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" md="6">
              <v-date-input
                v-model="tableFilters.spent_at"
                density="compact"
                label="Date Spent"
                multiple="range"
                clearable
                @click:clear="onFilterDate(true)"
                @update:model-value="onFilterDate(false)"
              ></v-date-input>
            </v-col>
          </v-row>

          <v-divider class="mb-5"></v-divider>

          <v-row dense>
            <v-spacer></v-spacer>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="tableFilters.search"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                placeholder="Search"
                clearable
                @click:clear="onSearchItems"
                @input="onSearchItems"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="2">
              <v-btn class="my-1" prepend-icon="mdi-plus" color="red-darken-4" block @click="onAdd">
                Add Amount
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-5"></v-divider>
        </template>

        <template #item.name="{ item }">
          <span class="font-weight-bold">
            {{ item.name }}
          </span>
        </template>

        <template #item.branches="{ item }">
          {{ item.branches.name }}
        </template>

        <template #item.spent_at="{ item }">
          <span class="font-weight-bold">
            {{ item.spent_at ? date.format(item.spent_at, 'fullDate') : '' }}
          </span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center justify-center">
            <v-btn variant="text" density="comfortable" @click="onUpdate(item)" icon>
              <v-icon icon="mdi-pencil" size="large"></v-icon>
              <v-tooltip activator="parent" location="top">Edit Expenditue</v-tooltip>
            </v-btn>

            <v-btn variant="text" density="comfortable" @click="onDelete(item.id)" icon>
              <v-icon icon="mdi-trash-can" color="red-darken-4"></v-icon>
              <v-tooltip activator="parent" location="top">Delete Expenditue</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>

  <ExpensesFormDialog
    v-model:is-dialog-visible="isDialogVisible"
    :item-data="itemData"
    :table-options="tableOptions"
    :table-filters="tableFilters"
  ></ExpensesFormDialog>

  <ConfirmDialog
    v-model:is-dialog-visible="isConfirmDeleteDialog"
    title="Confirm Delete"
    text="Are you sure you want to delete expenditure?"
    @confirm="onConfirmDelete"
  ></ConfirmDialog>
</template>
