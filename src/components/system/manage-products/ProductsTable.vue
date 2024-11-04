<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
// import ProductsFormDialog from './ProductsFormDialog.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { tableHeaders } from './productsTableUtils'
import { formActionDefault } from '@/utils/supabase'
import { useProductsStore } from '@/stores/products'
import { useDate } from 'vuetify'
import { ref } from 'vue'

// Utilize pre-defined vue functions
const date = useDate()

// Use Pinia Store
const productsStore = useProductsStore()

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

  const { error } = await productsStore.deleteExpenditure(deleteId.value)

  // Turn off processing
  formAction.value.formProcess = false

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    return
  }

  // Add Success Message
  formAction.value.formSuccessMessage = 'Successfully Deleted Product.'

  // Retrieve Data
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
const onLoadItems = async ({ page, itemsPerPage, sortBy }, tableFilters = { search: '' }) => {
  // Trigger Loading
  tableOptions.value.isLoading = true

  await productsStore.getProductsTable({ page, itemsPerPage, sortBy }, tableFilters)

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
        :items="productsStore.productsTable"
        :items-length="productsStore.productsTable.length"
        @update:options="onLoadItems"
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
                @click:clear="onSearchItems"
                @input="onSearchItems"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="2">
              <v-btn class="my-1" prepend-icon="mdi-plus" color="red-darken-4" block @click="onAdd">
                Add Product
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

        <template #item.created_at="{ item }">
          <span class="font-weight-bold">
            {{ item.created_at ? date.format(item.created_at, 'fullDate') : '' }}
          </span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center justify-center">
            <v-btn variant="text" density="comfortable" @click="onUpdate(item)" icon>
              <v-icon icon="mdi-pencil" size="large"></v-icon>
              <v-tooltip activator="parent" location="top">Edit Product</v-tooltip>
            </v-btn>

            <v-btn variant="text" density="comfortable" @click="onDelete(item.id)" icon>
              <v-icon icon="mdi-trash-can" color="red-darken-4"></v-icon>
              <v-tooltip activator="parent" location="top">Delete Product</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>

  <ConfirmDialog
    v-model:is-dialog-visible="isConfirmDeleteDialog"
    title="Confirm Delete"
    text="Are you sure you want to delete product?"
    @confirm="onConfirmDelete"
  ></ConfirmDialog>
</template>
