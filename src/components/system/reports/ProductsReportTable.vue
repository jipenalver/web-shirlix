<script setup>
import { getAvatarText, generateCSV, generateCSVTrim } from '@/utils/helpers'
import { tableHeaders } from './productsReportTableUtils'
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
  branch_id: null,
  product_id: null,
  date: null
})

// Retrieve Data based on Date
const onFilterDate = (isCleared = false) => {
  if (isCleared) tableFilters.value.date = null

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

  await reportsStore.getProductsReport({ page, itemsPerPage, sortBy }, tableFilters.value)

  // Trigger Loading
  tableOptions.value.isLoading = false
}

// CSV Data
const csvData = () => {
  // Get the headers from utils
  const headers = tableHeaders.map((header) => header.title)
  const addHeaders = ['Metric']
  const newHeaders = [...headers, ...addHeaders].join(',')

  // Get the reports data and map it to be used as csv data, follow the headers arrangement
  const rows = reportsStore.productsReport.map((item) => {
    // eslint-disable-next-line no-unused-vars
    const { date: createdDate, image_url, description, ...data } = item

    const arrayData = Object.values(data)

    return [generateCSVTrim(date.format(createdDate, 'fullDate')), ...arrayData].join(',')
  })

  // Combine headers and csv data
  return [newHeaders, ...rows].join('\n')
}

// Generate CSV
const onGenerate = () => {
  const filename = new Date().toISOString() + '-products-inventory-report'

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
        :items="reportsStore.productsReport"
        :items-length="reportsStore.productsReport.length"
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
                v-model="tableFilters.date"
                density="compact"
                label="Date"
                hint="Please Select Date"
                clearable
                persistent-hint
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
                :disabled="reportsStore.productsReport.length == 0"
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

        <template #item.date="{ item }">
          <span class="font-weight-bold">
            {{ date.format(item.date, 'fullDate') }}
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
                v-if="item.image_url"
                class="rounded-circle td-first-img"
                :class="mobile ? 'ml-auto my-2' : ''"
                color="red-darken-4"
                aspect-ratio="1"
                :src="item.image_url"
                alt="Product Picture"
                cover
              >
              </v-img>

              <v-avatar v-else color="red-darken-4" size="x-large">
                <span class="text-h5">
                  {{ getAvatarText(item.name) }}
                </span>
              </v-avatar>
            </div>

            <div>
              <span class="font-weight-bold">
                {{ item.name }}
              </span>
              <p class="text-caption">{{ item.description }}</p>
            </div>
          </div>
        </template>

        <template #item.stock_opening="{ item }">
          <span class="font-weight-bold">
            {{ item.stock_opening + ' ' + item.qty_metric }}
          </span>
        </template>

        <template #item.stock_in="{ item }">
          <span class="font-weight-black">
            {{ item.stock_in + ' ' + item.qty_metric }}
          </span>
        </template>

        <template #item.stock_sold="{ item }">
          <span class="font-weight-black">
            {{ item.stock_sold + ' ' + item.qty_metric }}
          </span>
        </template>

        <template #item.stock_transferred="{ item }">
          <span class="font-weight-bold">
            {{ item.stock_transferred + ' ' + item.qty_metric }}
          </span>
        </template>

        <template #item.stock_remaining="{ item }">
          <span class="font-weight-bold">
            {{ item.stock_remaining + ' ' + item.qty_metric }}
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
