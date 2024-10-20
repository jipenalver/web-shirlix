import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, tablePagination } from '@/utils/supabase'

export const useExpensesStore = defineStore('expenses', () => {
  // States
  const expensesTable = ref([])

  // Getters
  // const doubleCount = computed(() => count.value * 2)

  // Reset State Action
  function $reset() {
    expensesTable.value = []
  }

  // Retrieve Expenses
  async function getExpensesTable({ page, itemsPerPage, sortBy }, { search }) {
    // Handle Pagination
    const { rangeStart, rangeEnd, column, order } = tablePagination(
      page,
      itemsPerPage,
      sortBy,
      'name', // Default Column
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

  // Add Expenses
  async function addExpenditure(formData) {
    return await supabase.from('expenses').insert([formData]).select()
  }

  // Update Expenses
  async function updateExpenditure(formData) {
    return await supabase.from('expenses').update(formData).eq('id', formData.id).select()
  }

  // Delete Expenses
  async function deleteExpenditure(id) {
    return await supabase.from('expenses').delete().eq('id', id)
  }

  return {
    expensesTable,
    $reset,
    getExpensesTable,
    addExpenditure,
    updateExpenditure,
    deleteExpenditure
  }
})
