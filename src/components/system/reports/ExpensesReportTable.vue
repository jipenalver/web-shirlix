<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import { tableHeaders } from './expensesReportTableUtils'
import { formActionDefault } from '@/utils/supabase'
import { useExpensesStore } from '@/stores/expenses'
import { useDate } from 'vuetify'
import { ref } from 'vue'

// Utilize pre-defined vue functions
const date = useDate()

// Use Pinia Store
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
  spent_at: null
})
const formAction = ref({
  ...formActionDefault
})

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

  await expensesStore.getExpensesReport({ page, itemsPerPage, sortBy }, tableFilters)

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
        :items="expensesStore.expensesReport"
        :items-length="expensesStore.expensesReport.length"
        no-data-text="Use the above filter to display report"
        hide-default-footer
      >
        <template #top>
          <v-row dense>
            <v-col cols="12" md="8"></v-col>

            <v-col cols="12" md="4">
              <v-date-input
                v-model="tableFilters.spent_at"
                density="compact"
                label="Date Spent"
                multiple="range"
                hide-actions
              ></v-date-input>
            </v-col>

            <v-divider></v-divider>

            <v-col cols="12" md="8"></v-col>

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
