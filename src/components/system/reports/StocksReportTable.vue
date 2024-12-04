<script setup>
import { tableHeaders } from './stocksReportTableUtils'
import { useStockInStore } from '@/stores/stockIn'
import { useBranchesStore } from '@/stores/branches'
import { useProductsStore } from '@/stores/products'
import {
  getAvatarText,
  getMoneyText,
  getPadLeftText,
  generateCSV,
  generateCSVTrim,
  getPreciseNumber
} from '@/utils/helpers'
import { useDate } from 'vuetify'
import { onMounted, onUnmounted, ref } from 'vue'
import { useDisplay } from 'vuetify'

// Utilize pre-defined vue functions
const date = useDate()
const { mobile } = useDisplay()

// Use Pinia Store
const productsStore = useProductsStore()
const branchesStore = useBranchesStore()
const stockInStore = useStockInStore()

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

  await stockInStore.getStocksReport({ page, itemsPerPage, sortBy }, tableFilters.value)

  // Trigger Loading
  tableOptions.value.isLoading = false
}

// CSV Data
const csvData = () => {
  // Get the headers from utils
  const headers = tableHeaders.map((header) => header.title).join(',')
  const addHeaders = [
    'Unit Cost',
    'Portion of ID',
    'Unit Price',
    'Added Date',
    'Expiration Date',
    'Supplier',
    'Branch',
    'Remarks'
  ]
  const newHeaders = [headers, addHeaders].join(',')

  // Get the reports data and map it to be used as csv data, follow the headers arrangement
  const rows = stockInStore.stocksReport.map((data) => {
    return [
      "'" + getPadLeftText(data.id),
      generateCSVTrim(data.products.name),

      data.qty + ' ' + data.qty_metric,
      data.qty_reweighed ? data.qty_reweighed + ' ' + data.qty_metric : '-',
      data.qty_reweighed
        ? getPreciseNumber(data.qty - data.qty_reweighed) + ' ' + data.qty_metric
        : '-',

      data.purchased_at ? generateCSVTrim(date.format(data.purchased_at, 'fullDate')) : '',
      data.is_portion
        ? 'Stock Portion'
        : data.is_segregated
          ? 'Segregated'
          : data.is_reweighed
            ? 'Reweighed'
            : 'For Re-Weighing',

      data.unit_cost,
      data.stock_in_id ? "'" + getPadLeftText(data.stock_in_id) : '',
      data.unit_price ? data.unit_price + ' per ' + data.unit_price_metric : '',

      generateCSVTrim(date.format(data.created_at, 'fullDateTime')),
      data.expired_at ? generateCSVTrim(date.format(data.expired_at, 'fullDate')) : 'n/a',
      generateCSVTrim(data.supplier),
      generateCSVTrim(data.branches.name),
      generateCSVTrim(data.remarks)
    ].join(',')
  })

  // Combine headers and csv data
  return [newHeaders, ...rows].join('\n')
}

// Generate CSV
const onGenerate = () => {
  const filename = new Date().toISOString() + '-stockin-report'

  generateCSV(filename, csvData())
}

// If Component is Unloaded
onUnmounted(() => {
  stockInStore.$reset()
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
        :items="stockInStore.stocksReport"
        :items-length="stockInStore.stocksReport.length"
        no-data-text="Use the above filter to display report"
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
                :disabled="stockInStore.stocksReport.length == 0"
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
            :style="mobile ? 'height: auto' : 'height: 100px'"
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
              <p class="text-caption" v-if="item.unit_cost">
                <span class="font-weight-bold">Unit Cost:</span>
                {{ getMoneyText(item.unit_cost) }}
              </p>
              <p class="text-caption" v-else-if="item.is_portion">
                <span class="font-weight-bold">Portion of ID:</span>
                {{ getPadLeftText(item.stock_in_id) }}
                <br />
                <span class="font-weight-bold">Unit Price:</span>
                {{ getMoneyText(item.unit_price) }} per {{ item.unit_price_metric }}
              </p>
            </div>
          </div>
        </template>

        <template #item.qty="{ item }">
          <span class="font-weight-bold">
            {{ item.qty + ' ' + item.qty_metric }}
          </span>
        </template>

        <template #item.qty_reweighed="{ item }">
          <span class="font-weight-bold">
            {{ item.qty_reweighed ? item.qty_reweighed + ' ' + item.qty_metric : '-' }}
          </span>
        </template>

        <template #item.weight_loss="{ item }">
          <span class="font-weight-bold">
            {{
              item.qty_reweighed
                ? getPreciseNumber(item.qty - item.qty_reweighed) + ' ' + item.qty_metric
                : '-'
            }}
          </span>
        </template>

        <template #item.purchased_at="{ item }">
          <span class="font-weight-bold">
            {{ item.purchased_at ? date.format(item.purchased_at, 'fullDate') : '' }}
          </span>
        </template>

        <template #item.status="{ item }">
          <v-chip class="font-weight-bold cursor-pointer" prepend-icon="mdi-information">
            {{
              item.is_portion
                ? 'Stock Portion'
                : item.is_segregated
                  ? 'Segregated'
                  : item.is_reweighed
                    ? 'Reweighed'
                    : 'For Re-Weighing'
            }}

            <v-tooltip activator="parent" location="top" open-on-click>
              <ul class="ms-2">
                <li>
                  <span class="font-weight-bold">Added Date:</span>
                  {{ date.format(item.created_at, 'fullDateTime') }}
                </li>
                <li>
                  <span class="font-weight-bold">Expiration Date:</span>
                  {{ item.expired_at ? date.format(item.expired_at, 'fullDate') : 'n/a' }}
                </li>
                <li><span class="font-weight-bold">Supplier:</span> {{ item.supplier }}</li>
                <li><span class="font-weight-bold">Branch:</span> {{ item.branches.name }}</li>
                <li><span class="font-weight-bold">Remarks:</span> {{ item.remarks }}</li>
              </ul>
            </v-tooltip>
          </v-chip>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>
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
