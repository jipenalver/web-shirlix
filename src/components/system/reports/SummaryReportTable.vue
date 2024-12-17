<script setup>
import {
  generateCSV,
  generateCSVTrim,
  getAccumulatedNumber,
  getMoneyText,
  getPreciseNumber
} from '@/utils/helpers'
import { tableHeaders } from './summaryReportTableUtils'
import { useBranchesStore } from '@/stores/branches'
import { useSummaryStore } from '@/stores/summary'
import { onMounted, onUnmounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useDate } from 'vuetify'

// Utilize pre-defined vue functions
const date = useDate()
const { mobile } = useDisplay()

// Use Pinia Store
const branchesStore = useBranchesStore()
const summaryStore = useSummaryStore()

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
  date_range: [new Date(date.format(new Date(), 'fullDate'))]
})

// Retrieve Data based on Date
const onFilterDate = (isCleared = false) => {
  if (isCleared) tableFilters.value.date_range = null

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

  await summaryStore.getSummaryReport({ page, itemsPerPage, sortBy }, tableFilters.value)

  // Trigger Loading
  tableOptions.value.isLoading = false
}

// CSV Data
const csvData = () => {
  // Get the headers from utils
  const headers = tableHeaders.map((header) => header.title).join(',')

  // Get the reports data and map it to be used as csv data, follow the headers arrangement
  const rows = summaryStore.summaryReport.map((item) => {
    return [
      generateCSVTrim(date.format(item.date, 'fullDate')),
      item.inventory,
      item.sales,
      item.receivable,
      item.expenses,
      getPreciseNumber(item.sales - item.expenses)
    ].join(',')
  })

  // Combine headers and csv data
  return [headers, ...rows].join('\n')
}

// Generate CSV
const onGenerate = () => {
  const filename = new Date().toISOString() + '-summary-report'

  generateCSV(filename, csvData())
}

// If Component is Unloaded
onUnmounted(() => {
  summaryStore.$reset()
})

// Load Functions during component rendering
onMounted(async () => {
  if (branchesStore.branches.length == 0) await branchesStore.getBranches()
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
        :items="summaryStore.summaryReport"
        :items-length="summaryStore.summaryReport.length"
        @update:sort-by="(sortBy) => onLoadItems({ sortBy })"
        no-data-text="Use the above filter to display report"
        hide-default-footer
        :hide-default-header="mobile"
        :mobile="mobile"
      >
        <template #top>
          <v-row dense>
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

            <v-col cols="12" sm="6">
              <v-date-input
                v-model="tableFilters.date_range"
                density="compact"
                label="Date Range"
                multiple="range"
                clearable
                @click:clear="onFilterDate(true)"
                @update:model-value="onFilterDate(false)"
              ></v-date-input>
            </v-col>
          </v-row>

          <v-divider class="mb-5"></v-divider>

          <v-row dense>
            <v-col cols="12" sm="3">
              <ul class="ms-5">
                <li>
                  Inventory:
                  <b>
                    {{
                      getMoneyText(getAccumulatedNumber(summaryStore.summaryReport, 'inventory'))
                    }}
                  </b>
                </li>
                <li>
                  Profit Gross:
                  <b>
                    {{ getMoneyText(getAccumulatedNumber(summaryStore.summaryReport, 'sales')) }}
                  </b>
                </li>
              </ul>
            </v-col>

            <v-col cols="12" sm="3">
              <ul class="ms-5">
                <li>
                  Receivable:
                  <b>
                    {{
                      getMoneyText(getAccumulatedNumber(summaryStore.summaryReport, 'receivable'))
                    }}
                  </b>
                </li>
                <li>
                  Expenses:
                  <b>
                    {{ getMoneyText(getAccumulatedNumber(summaryStore.summaryReport, 'expenses')) }}
                  </b>
                </li>
              </ul>
            </v-col>

            <v-col cols="12" sm="3" class="d-flex align-center">
              <ul class="ms-5">
                <li>
                  Net Profit:
                  <b>
                    {{ getMoneyText(getAccumulatedNumber(summaryStore.summaryReport, 'profit')) }}
                  </b>
                </li>
              </ul>
            </v-col>

            <v-col cols="12" sm="3">
              <v-btn
                :disabled="summaryStore.summaryReport.length == 0"
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
          <div
            class="td-first"
            :class="mobile ? '' : 'd-flex align-center'"
            :style="mobile ? 'height: auto' : ''"
          >
            <span class="font-weight-bold">
              {{ date.format(item.date, 'fullDate') }}
            </span>
          </div>
        </template>

        <template #item.inventory="{ item }">
          <span class="font-weight-bold">
            {{ getMoneyText(item.inventory) }}
          </span>
        </template>

        <template #item.profit_gross="{ item }">
          <span class="font-weight-bold">
            {{ getMoneyText(item.sales) }}
          </span>
        </template>

        <template #item.receivable="{ item }">
          <span class="font-weight-bold">
            {{ getMoneyText(item.receivable) }}
          </span>
        </template>

        <template #item.expenses="{ item }">
          <span class="font-weight-bold">
            {{ getMoneyText(item.expenses) }}
          </span>
        </template>

        <template #item.profit_net="{ item }">
          <span class="font-weight-bold">
            {{ getMoneyText(item.profit) }}
          </span>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>
</template>

<style scoped>
.td-first {
  height: 75px;
}
</style>
