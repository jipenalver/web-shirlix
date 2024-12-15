<script setup>
import { generateCSV, generateCSVTrim } from '@/utils/helpers'
import { tableHeaders } from './expensesReportTableUtils'
import { useExpensesStore } from '@/stores/expenses'
import { useBranchesStore } from '@/stores/branches'
import { onMounted, onUnmounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useDate } from 'vuetify'

// Utilize pre-defined vue functions
const date = useDate()
const { mobile } = useDisplay()

// Use Pinia Store
const branchesStore = useBranchesStore()
const expensesStore = useExpensesStore()

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
  spent_at: null
})

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
const onLoadItems = async ({ page, itemsPerPage, sortBy }, isSorting = false) => {
  // Trigger Loading
  tableOptions.value.isLoading = true

  if (isSorting) await expensesStore.getExpensesReport({ sortBy }, tableFilters.value)
  else await expensesStore.getExpensesReport({ page, itemsPerPage, sortBy }, tableFilters.value)

  // Trigger Loading
  tableOptions.value.isLoading = false
}

// CSV Data
const csvData = () => {
  // Get the headers from utils
  const headers = tableHeaders.map((header) => header.title).join(',')

  // Get the reports data and map it to be used as csv data, follow the headers arrangement
  const rows = expensesStore.expensesReport.map((item) => {
    return [
      generateCSVTrim(item.name),
      item.amount,
      generateCSVTrim(item.description),
      generateCSVTrim(item.branches.name),
      item.spent_at ? generateCSVTrim(date.format(item.spent_at, 'fullDate')) : ''
    ].join(',')
  })

  // Combine headers and csv data
  return [headers, ...rows].join('\n')
}

// Generate CSV
const onGenerate = () => {
  const filename = new Date().toISOString() + '-expenditures-report'

  generateCSV(filename, csvData())
}

// If Component is Unloaded
onUnmounted(() => {
  expensesStore.$reset()
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
        :items="expensesStore.expensesReport"
        :items-length="expensesStore.expensesReport.length"
        no-data-text="Use the above filter to display report"
        @update:sort-by="(sortBy) => onLoadItems(sortBy, true)"
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
              <v-btn
                :disabled="expensesStore.expensesReport.length == 0"
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
      </v-data-table-server>
    </v-col>
  </v-row>
</template>
