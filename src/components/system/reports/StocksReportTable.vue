<script setup>
import {
  getAvatarText,
  getMoneyText,
  getPadLeftText,
  generateCSV,
  generateCSVTrim,
  getAccumulatedNumber,
  getPreciseNumber
} from '@/utils/helpers'
import TransferFormDialog from './stocks/TransferFormDialog.vue'
import { tableHeaders } from './stocksReportTableUtils'
import { useBranchesStore } from '@/stores/branches'
import { useProductsStore } from '@/stores/products'
import { useReportsStore } from '@/stores/reports'
import { onMounted, onUnmounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useDate } from 'vuetify'

// Utilize pre-defined vue functions
const date = useDate()
const { mobile } = useDisplay()

// Use Pinia Store
const productsStore = useProductsStore()
const branchesStore = useBranchesStore()
const reportsStore = useReportsStore()

// Load Variables
const tableOptions = ref({
  page: 1,
  itemsPerPage: -1,
  sortBy: [],
  isLoading: false
})
const tableFilters = ref({
  search: '',
  branch_id: null,
  product_id: null,
  purchased_at: null
})
const isTransferFormDialogVisible = ref(false)
const itemData = ref(null)

// Calculate Sold Qty
const getSoldQty = (item) => {
  return getAccumulatedNumber(item.sale_products, 'qty') + ' ' + item.qty_metric
}

// Calculate Stock In Qty
const getStockInQty = (item) => {
  return item.qty_reweighed
    ? item.qty_reweighed + ' ' + item.qty_metric
    : item.qty + ' ' + item.qty_metric
}

// Calculate Stock Remaining
const getStockRemaining = (item) => {
  return getPreciseNumber(item.qty_reweighed - getAccumulatedNumber(item.sale_products, 'qty'))
}

// Trigger Transfer Btn
const onTransfer = (item) => {
  itemData.value = { ...item, stock_remaining: getStockRemaining(item) }
  isTransferFormDialogVisible.value = true
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

  await reportsStore.getStocksReport({ page, itemsPerPage, sortBy }, tableFilters.value)

  // Trigger Loading
  tableOptions.value.isLoading = false
}

// CSV Data
const csvData = () => {
  // Get the headers from utils
  const headers = tableHeaders.slice(0, -1).map((header) => header.title)
  const addHeaders = ['Unit Price', 'Added Date', 'Purchased Date', 'Supplier', 'Branch', 'Remarks']
  const newHeaders = [...headers, ...addHeaders].join(',')

  // Get the reports data and map it to be used as csv data, follow the headers arrangement
  const rows = reportsStore.stocksReport.map((item) => {
    return [
      "'" + getPadLeftText(item.id),
      generateCSVTrim(item.products.name),
      getStockInQty(item),
      item.sale_products.length === 0 ? '-' : getSoldQty(item),
      item.is_portion ? getStockRemaining(item) + ' ' + item.qty_metric : getStockInQty(item),
      item.expired_at ? generateCSVTrim(date.format(item.expired_at, 'fullDate')) : 'n/a',
      item.is_portion ? (getStockRemaining(item) > 0 ? 'In Stock' : 'Out of Stock') : 'Inventory',

      item.unit_price,
      generateCSVTrim(date.format(item.created_at, 'fullDateTime')),
      generateCSVTrim(date.format(item.purchased_at, 'fullDate')),
      generateCSVTrim(item.supplier),
      generateCSVTrim(item.branches.name),
      generateCSVTrim(item.remarks)
    ].join(',')
  })

  // Combine headers and csv data
  return [newHeaders, ...rows].join('\n')
}

// Generate CSV
const onGenerate = () => {
  const filename = new Date().toISOString() + '-stocks-report'

  generateCSV(filename, csvData())
}

// If Component is Unloaded
onUnmounted(() => {
  reportsStore.$reset()
})

// Load Functions during component rendering
onMounted(async () => {
  if (branchesStore.branches.length == 0) await branchesStore.getBranches()
  if (productsStore.products.length == 0) await productsStore.getProducts()
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
        :items="reportsStore.stocksReport"
        :items-length="reportsStore.stocksReport.length"
        no-data-text="Use the above filter to display report"
        @update:sort-by="(sortBy) => onLoadItems({ sortBy })"
        hide-default-footer
        :hide-default-header="mobile"
        :mobile="mobile"
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
                placeholder="Search by ID, Supplier or Remarks"
                clearable
                @click:clear="onSearchItems"
                @input="onSearchItems"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="3">
              <v-btn
                :disabled="reportsStore.stocksReport.length == 0"
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

        <template #item.products="{ item }">
          <div
            class="td-first"
            :class="mobile ? '' : 'd-flex align-center'"
            :style="mobile ? 'height: auto' : ''"
          >
            <div class="me-2">
              <v-img
                v-if="item.products.image_url"
                class="rounded-circle td-first-img"
                :class="mobile ? 'ml-auto my-2' : ''"
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
              <p class="text-caption" v-if="item.total_cost">
                <span class="font-weight-bold">Total Cost:</span>
                {{ getMoneyText(item.total_cost) }}
              </p>
              <p class="text-caption" v-else-if="item.is_portion">
                <span class="font-weight-bold">Portion of ID:</span>
                {{ getPadLeftText(item.stock_in_id) }}
                <br />
                <span class="font-weight-bold">Unit Price:</span>
                {{ getMoneyText(item.unit_price) }} / {{ item.unit_price_metric }}
              </p>
            </div>
          </div>
        </template>

        <template #item.qty_reweighed="{ item }">
          <span class="font-weight-bold">
            {{ getStockInQty(item) }}
          </span>
        </template>

        <template #item.qty_sold="{ item }">
          <span class="font-weight-black">
            {{ item.sale_products.length === 0 ? '-' : getSoldQty(item) }}
          </span>
        </template>

        <template #item.qty_remaining="{ item }">
          <span class="font-weight-black">
            {{
              item.is_portion
                ? getStockRemaining(item) + ' ' + item.qty_metric
                : getStockInQty(item)
            }}
          </span>
        </template>

        <template #item.expired_at="{ item }">
          <span class="font-weight-bold">
            {{ item.expired_at ? date.format(item.expired_at, 'fullDate') : 'n/a' }}
          </span>
        </template>

        <template #item.status="{ item }">
          <v-chip
            class="font-weight-bold cursor-pointer"
            prepend-icon="mdi-information"
            :color="
              item.is_portion ? (getStockRemaining(item) > 0 ? undefined : 'error') : 'success'
            "
          >
            {{
              item.is_portion
                ? getStockRemaining(item) > 0
                  ? 'In Stock'
                  : 'Out of Stock'
                : 'Inventory'
            }}

            <v-tooltip activator="parent" location="top" open-on-click>
              <ul class="ms-2">
                <li>
                  <span class="font-weight-bold">Added Date:</span>
                  {{ date.format(item.created_at, 'fullDateTime') }}
                </li>
                <li>
                  <span class="font-weight-bold">Purchased Date:</span>
                  {{ date.format(item.purchased_at, 'fullDate') }}
                </li>
                <li><span class="font-weight-bold">Supplier:</span> {{ item.supplier }}</li>
                <li><span class="font-weight-bold">Branch:</span> {{ item.branches.name }}</li>
                <li><span class="font-weight-bold">Remarks:</span> {{ item.remarks }}</li>
              </ul>
            </v-tooltip>
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center" :class="mobile ? 'justify-end' : 'justify-center'">
            <v-btn
              variant="text"
              density="comfortable"
              @click="onTransfer(item)"
              :disabled="!item.is_portion || getStockRemaining(item) === 0"
              icon
            >
              <v-icon icon="mdi-transfer"></v-icon>
              <v-tooltip activator="parent" location="top">Transfer Remaining Qty</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>

  <TransferFormDialog
    v-model:is-dialog-visible="isTransferFormDialogVisible"
    :item-data="itemData"
    :table-options="tableOptions"
    :table-filters="tableFilters"
  ></TransferFormDialog>
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
