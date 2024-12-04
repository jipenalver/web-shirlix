<script setup>
import { tableHeaders } from './salesReportTableUtils'
import { useReportsStore } from '@/stores/reports'
import { useSalesStore } from '@/stores/sales'
import { useBranchesStore } from '@/stores/branches'
import { generateCSV, generateCSVTrim, getMoneyText, getPadLeftText } from '@/utils/helpers'
import { useDate } from 'vuetify'
import { onMounted, onUnmounted, ref } from 'vue'
import { useDisplay } from 'vuetify'

// Utilize pre-defined vue functions
const date = useDate()
const { mobile } = useDisplay()

// Use Pinia Store
const branchesStore = useBranchesStore()
const salesStore = useSalesStore()
const reportsStore = useReportsStore()

// Load Variables
const tableOptions = ref({
  page: 1,
  itemsPerPage: -1,
  sortBy: [],
  isLoading: false
})
const tableFilters = ref({
  customer_id: null,
  branch_id: null,
  created_at: null
})
const itemData = ref(null)
const isViewProductsDialog = ref(false)
const isViewPaymentsDialog = ref(false)

// View Products
const onViewProducts = (item) => {
  itemData.value = item
  isViewProductsDialog.value = true
}

// View Payments
const onViewPayments = (item) => {
  itemData.value = item
  isViewPaymentsDialog.value = true
}

// Retrieve Data based on Date
const onFilterDate = (isCleared = false) => {
  if (isCleared) tableFilters.value.created_at = null

  onLoadItems(tableOptions.value, tableFilters.value)
}

// Retrieve Data based on Filter
const onFilterItems = () => {
  onLoadItems(tableOptions.value, tableFilters.value)
}

// Load Tables Data
const onLoadItems = async ({ page, itemsPerPage, sortBy }) => {
  // Trigger Loading
  tableOptions.value.isLoading = true

  await reportsStore.getSalesReport({ page, itemsPerPage, sortBy }, tableFilters.value)

  // Trigger Loading
  tableOptions.value.isLoading = false
}

// CSV Data
const csvData = () => {
  // Get the headers from utils
  const headers = tableHeaders
    .slice(0, -1)
    .map((header) => header.title)
    .join(',')

  // Get the reports data and map it to be used as csv data, follow the headers arrangement
  const rows = reportsStore.salesReport.map((data) => {
    return [
      "'" + getPadLeftText(data.id),
      data.overall_price,
      data.is_cash_discount ? data.discount : data.discount + '%',
      data.exact_price,
      data.customers.customer ? generateCSVTrim(data.customers.customer) : '-',
      data.branches.name ? generateCSVTrim(data.branches.name) : '-',
      data.created_at ? generateCSVTrim(date.format(data.created_at, 'fullDateTime')) : ''
    ].join(',')
  })

  // Combine headers and csv data
  return [headers, ...rows].join('\n')
}

// Generate CSV
const onGenerate = () => {
  const filename = new Date().toISOString() + '-sales-report'

  generateCSV(filename, csvData())
}

// If Component is Unloaded
onUnmounted(() => {
  reportsStore.$reset()
})

// Load Functions during component rendering
onMounted(async () => {
  if (branchesStore.branches.length == 0) await branchesStore.getBranches()
  if (salesStore.customers.length == 0) await salesStore.getCustomers()
})
</script>

<template>
  <v-row>
    <v-col cols="12">
      <!-- eslint-disable vue/valid-v-slot -->
      <v-data-table-server
        v-model:items-per-page="tableOptions.itemsPerPage"
        v-model:page="tableOptions.page"
        v-model:sort-by="tableOptions.sortBy"
        :loading="tableOptions.isLoading"
        :headers="tableHeaders"
        :items="reportsStore.salesReport"
        :items-length="reportsStore.salesReport.length"
        no-data-text="Use the above filter to display report"
        @update:sort-by="onLoadItems"
        hide-default-footer
        :hide-default-header="mobile"
        :mobile="mobile"
      >
        <template #top>
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-autocomplete
                v-model="tableFilters.customer_id"
                :items="salesStore.customers"
                density="compact"
                label="Customer"
                item-title="customer"
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
                v-model="tableFilters.created_at"
                density="compact"
                label="Date Sold"
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

            <v-col cols="12" sm="3">
              <v-btn
                :disabled="reportsStore.salesReport.length == 0"
                class="my-1"
                prepend-icon="mdi-file-delimited"
                color="red-darken-4"
                block
                @click="onGenerate"
              >
                Generate CSV
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

        <template #item.overall_price="{ item }">
          <span class="font-weight-bold">
            {{ getMoneyText(item.overall_price) }}
          </span>
        </template>

        <template #item.discount="{ item }">
          <div>
            <h4>
              {{ item.is_cash_discount ? 'Cash' : 'Percent' }}: <br />
              {{ item.is_cash_discount ? getMoneyText(item.discount) : item.discount + '%' }}
            </h4>
          </div>
        </template>

        <template #item.exact_price="{ item }">
          <span class="font-weight-bold">
            {{ getMoneyText(item.exact_price) }}
          </span>
        </template>

        <template #item.customer_id="{ item }">
          <span>
            {{ item.customers?.customer ?? '-' }}
          </span>
        </template>

        <template #item.branch_id="{ item }">
          <span>
            {{ item.branches?.name ?? '-' }}
          </span>
        </template>

        <template #item.created_at="{ item }">
          <span class="font-weight-bold">
            {{ item.created_at ? date.format(item.created_at, 'fullDateTime') : '' }}
          </span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center" :class="mobile ? 'justify-end' : 'justify-center'">
            <v-btn variant="text" density="comfortable" @click="onViewProducts(item)" icon>
              <v-icon icon="mdi-view-list"></v-icon>
              <v-tooltip activator="parent" location="top">View Sold Products</v-tooltip>
            </v-btn>

            <v-btn variant="text" density="comfortable" @click="onViewPayments(item)" icon>
              <v-icon icon="mdi-account-credit-card" color="red-darken-4"></v-icon>
              <v-tooltip activator="parent" location="top">View Payments</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>
</template>
