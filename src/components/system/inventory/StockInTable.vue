<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import StockInFormDialog from './StockInFormDialog.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { tableHeaders } from './stockInTableUtils'
import { formActionDefault } from '@/utils/supabase'
import { useStockInStore } from '@/stores/stockIn'
import { useBranchesStore } from '@/stores/branches'
import { useProductsStore } from '@/stores/products'
import { getAvatarText, getMoneyText, getPadLeftText } from '@/utils/helpers'
import { useDate } from 'vuetify'
import { onMounted, ref } from 'vue'

// Utilize pre-defined vue functions
const date = useDate()

// Use Pinia Store
const productsStore = useProductsStore()
const branchesStore = useBranchesStore()
const stockInStore = useStockInStore()

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
  product_id: null,
  purchased_at: [new Date(date.format(new Date(), 'fullDate'))]
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

  const { error } = await stockInStore.deleteStockIn(deleteId.value)

  // Turn off processing
  formAction.value.formProcess = false

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    return
  }

  // Add Success Message
  formAction.value.formSuccessMessage = 'Successfully Deleted Stock.'

  // Retrieve Data
  onLoadItems(tableOptions.value, tableFilters.value)
}

// Retrieve Data based on Date
const onFilterDate = (isCleared = false) => {
  if (isCleared) tableFilters.value.purchased_at = null

  onLoadItems(tableOptions.value, tableFilters.value)
}

// Retrieve Data based on Filter
const onFilterItems = () => {
  onLoadItems(tableOptions.value, tableFilters.value)
}

// Retrieve Data based on Search
const onSearchItems = () => {
  if (
    tableFilters.value.search?.length >= 4 ||
    tableFilters.value.search?.length == 0 ||
    tableFilters.value.search === null
  )
    onLoadItems(tableOptions.value, tableFilters.value)
}

// Load Tables Data
const onLoadItems = async ({ page, itemsPerPage, sortBy }) => {
  // Trigger Loading
  tableOptions.value.isLoading = true

  await stockInStore.getStockInTable({ page, itemsPerPage, sortBy }, tableFilters.value)

  // Trigger Loading
  tableOptions.value.isLoading = false
}

// Load Functions during component rendering
onMounted(async () => {
  if (branchesStore.branches.length == 0) await branchesStore.getBranches()
  if (productsStore.products.length == 0) await productsStore.getProducts()
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
        :items="stockInStore.stockInTable"
        :items-length="stockInStore.stockInTotal"
        @update:options="onLoadItems"
      >
        <template #top>
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-autocomplete
                v-model="tableFilters.product_id"
                :items="productsStore.products"
                density="compact"
                label="Product"
                item-title="name"
                item-value="id"
                clearable
                @update:model-value="onFilterItems"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" sm="4">
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

            <v-col cols="12" sm="4">
              <v-date-input
                v-model="tableFilters.purchased_at"
                density="compact"
                label="Date Purchased"
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

            <v-col cols="12" sm="5">
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

            <v-col cols="12" sm="3">
              <v-btn class="my-1" prepend-icon="mdi-plus" color="red-darken-4" block @click="onAdd">
                Add Stock
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-5"></v-divider>
        </template>

        <template #item.id="{ item }">
          <span class="font-weight-bold">
            {{ getPadLeftText(item.id) }}
          </span>
        </template>

        <template #item.products="{ item }">
          <div class="d-flex align-center td-first">
            <div class="me-2">
              <v-img
                v-if="item.products.image_url"
                class="rounded-circle td-first-img"
                color="red-darken-4"
                aspect-ratio="1"
                :src="item.products.image_url"
                alt="Product Picture"
                cover
              >
              </v-img>

              <v-avatar v-else color="red-darken-4" size="x-large">
                <span class="text-h5">
                  {{ getAvatarText(item.products.name) }}
                </span>
              </v-avatar>
            </div>

            <div>
              <span class="font-weight-bold">
                {{ item.products.name }}
              </span>
              <p class="text-caption">{{ item.products.description }}</p>
              <p class="text-caption">
                <span class="font-weight-bold">Price:</span>
                {{ getMoneyText(item.price) }}
              </p>
            </div>
          </div>
        </template>

        <template #item.qty="{ item }">
          <span class="font-weight-bold">
            {{ item.qty + ' ' + item.qty_metric }}
          </span>
        </template>

        <template #item.purchased_at="{ item }">
          <span class="font-weight-bold">
            {{ item.purchased_at ? date.format(item.purchased_at, 'fullDate') : '' }}
          </span>
        </template>

        <template #item.expired_at="{ item }">
          <span class="font-weight-bold">
            {{ item.expired_at ? date.format(item.expired_at, 'fullDate') : 'n/a' }}
          </span>
        </template>

        <template #item.status="{ item }">
          <v-chip class="font-weight-bold cursor-pointer" prepend-icon="mdi-information">
            {{ item.is_reweighed ? 'Reweighed' : 'For Re-Weighing' }}

            <v-tooltip activator="parent" location="top">
              <span class="font-weight-bold">Added Date:</span>
              {{ date.format(item.created_at, 'fullDateTime') }} <br />
              <span class="font-weight-bold">Branch:</span> {{ item.branches.name }} <br />
              <span class="font-weight-bold">Supplier:</span> {{ item.supplier }} <br />
              <span class="font-weight-bold">Remarks:</span> {{ item.remarks }} <br />
            </v-tooltip>
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center justify-center">
            <v-btn variant="text" density="comfortable" @click="onUpdate(item)" icon>
              <v-icon icon="mdi-pencil"></v-icon>
              <v-tooltip activator="parent" location="top">Edit Stock</v-tooltip>
            </v-btn>

            <v-btn variant="text" density="comfortable" @click="onDelete(item.id)" icon>
              <v-icon icon="mdi-trash-can" color="red-darken-4"></v-icon>
              <v-tooltip activator="parent" location="top">Delete Stock</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>

  <StockInFormDialog
    v-model:is-dialog-visible="isDialogVisible"
    :item-data="itemData"
    :table-options="tableOptions"
    :table-filters="tableFilters"
  ></StockInFormDialog>

  <ConfirmDialog
    v-model:is-dialog-visible="isConfirmDeleteDialog"
    title="Confirm Delete"
    text="Are you sure you want to delete stock?"
    @confirm="onConfirmDelete"
  ></ConfirmDialog>
</template>

<style scoped>
.td-first {
  height: 100px;
  min-width: 200px;
}

.td-first-img {
  width: 65px;
}
</style>
