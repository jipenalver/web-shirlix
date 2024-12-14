<script setup>
import { tableHeaders } from './stocksReportTableUtils'
import { useReportsStore } from '@/stores/reports'
import { useBranchesStore } from '@/stores/branches'
import { useProductsStore } from '@/stores/products'
import {
  getAvatarText,
  getMoneyText,
  getPadLeftText,
  generateCSV,
  generateCSVTrim
} from '@/utils/helpers'
import { onMounted, onUnmounted, ref } from 'vue'
import { useDisplay } from 'vuetify'

// Utilize pre-defined vue functions
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
  product_id: null
})

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

// Load Tables Data
const onLoadSortItems = async (sortBy) => {
  // Trigger Loading
  tableOptions.value.isLoading = true

  await reportsStore.getStocksReport({ sortBy }, tableFilters.value)

  // Trigger Loading
  tableOptions.value.isLoading = false
}

// CSV Data
const csvData = () => {
  // Get the headers from utils
  const headers = tableHeaders.map((header) => header.title).join(',')

  // Get the reports data and map it to be used as csv data, follow the headers arrangement
  const rows = reportsStore.stocksReport.map((data) => {
    return [
      generateCSVTrim(data.products.name),
      data.unit_cost,
      data.stock_in_id ? "'" + getPadLeftText(data.stock_in_id) : '',
      data.unit_price ? data.unit_price + ' per ' + data.unit_price_metric : '',

      generateCSVTrim(data.branches.name)
    ].join(',')
  })

  // Combine headers and csv data
  return [headers, ...rows].join('\n')
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
        @update:sort-by="onLoadSortItems"
        hide-default-footer
        :hide-default-header="mobile"
        :mobile="mobile"
      >
        <template #top>
          <v-row dense>
            <v-col cols="12" sm="6">
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

            <v-col cols="12" sm="6">
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
          </v-row>

          <v-divider class="mb-5"></v-divider>

          <v-row dense>
            <v-spacer></v-spacer>

            <v-col cols="12" sm="5">
              <v-text-field
                v-model="tableFilters.search"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                placeholder="Search Name"
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

        <template #item.qty_total="{ item }">
          <span class="font-weight-bold"> </span>
        </template>

        <template #item.qty_sold="{ item }">
          <span class="font-weight-bold"> </span>
        </template>

        <template #item.qty_remaining="{ item }">
          <span class="font-weight-bold"> </span>
        </template>

        <template #item.branch_id="{ item }">
          <span class="font-weight-bold">
            {{ item.branches.name }}
          </span>
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
