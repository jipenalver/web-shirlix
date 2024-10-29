import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, tablePagination } from '@/utils/supabase'
import { dateShiftFix } from '@/utils/helpers'
import { useDate } from 'vuetify'

export const useExpensesStore = defineStore('expenses', () => {
  // Utilize pre-defined vue functions
  const date = useDate()

  // States
  const expensesTable = ref([])
  const expensesReport = ref([])

  // Reset State Action
  function $reset() {
    expensesTable.value = []
  }

  // Retrieve Expenses Table
  async function getExpensesTable({ page, itemsPerPage, sortBy }, { search }) {
    // Handle Pagination
    const { rangeStart, rangeEnd, column, order } = tablePagination(
      page,
      itemsPerPage,
      sortBy,
      'name', // Default Column to be sorted
      true // true = Ascending, false = Descending
    )
    // Handle Search if null turn to empty string
    search = search || ''

    // Query Supabase with pagination and sorting
    const { data } = await supabase
      .from('expenses')
      .select('*, branches( name )')
      .or('name.ilike.%' + search + '%, description.ilike.%' + search + '%')
      .order(column, { ascending: order })
      .range(rangeStart, rangeEnd)

    // Set the retrieved data to state
    expensesTable.value = data
  }

  // Retrieve Expenses Report
  async function getExpensesReport({ page, itemsPerPage, sortBy }, { search }) {
    // Handle Pagination
    const { column, order } = tablePagination(
      page,
      itemsPerPage,
      sortBy,
      'name', // Default Column to be sorted
      true // true = Ascending, false = Descending
    )
    // Handle Search if null turn to empty string
    search = search || ''

    // Query Supabase with pagination and sorting
    const { data } = await supabase
      .from('expenses')
      .select('*, branches( name )')
      .or('name.ilike.%' + search + '%, description.ilike.%' + search + '%')
      .order(column, { ascending: order })

    // Set the retrieved data to state
    expensesReport.value = data
  }

  // Add Expenses
  async function addExpenditure(formData) {
    return await supabase.from('expenses').insert([formData]).select()
  }

  // Update Expenses
  async function updateExpenditure(formData) {
    // eslint-disable-next-line no-unused-vars
    const { branches, ...data } = dateShiftFix(date, formData, ['spent_at'])

    return await supabase.from('expenses').update(data).eq('id', formData.id).select()
  }

  // Delete Expenses
  async function deleteExpenditure(id) {
    return await supabase.from('expenses').delete().eq('id', id)
  }

  return {
    expensesTable,
    expensesReport,
    $reset,
    getExpensesTable,
    getExpensesReport,
    addExpenditure,
    updateExpenditure,
    deleteExpenditure
  }
})
