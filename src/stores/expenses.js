import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, tablePagination, tableSearch } from '@/utils/supabase'
import { dateShiftFixForm, dateShiftFixValue } from '@/utils/helpers'

export const useExpensesStore = defineStore('expenses', () => {
  // States
  const expensesTable = ref([])
  const expensesReport = ref([])
  const expensesTotal = ref(0)

  // Reset State Action
  function $reset() {
    expensesTable.value = []
    expensesReport.value = []
    expensesTotal.value = 0
  }

  // Retrieve Expenses Table
  async function getExpensesTable(tableOptions, { search, branch_id, spent_at }) {
    const { rangeStart, rangeEnd, column, order } = tablePagination(tableOptions, 'name') // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true
    search = tableSearch(search) // Handle Search if null turn to empty string

    // Query Supabase with pagination and sorting
    let query = supabase
      .from('expenses')
      .select('*, branches( name )')
      .order(column, { ascending: order })
      .range(rangeStart, rangeEnd)

    query = getExpensesFilter(query, { search, branch_id, spent_at })

    // Execute the query
    const { data } = await query

    // Separate query to get the total count without range
    const { count } = await getExpensesCount({ search, branch_id, spent_at })

    // Set the retrieved data to state
    expensesTable.value = data
    expensesTotal.value = count
  }

  // Retrieve Expenses Report
  async function getExpensesReport(tableOptions, { search, branch_id, spent_at }) {
    const { column, order } = tablePagination(tableOptions, 'name') // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true
    search = tableSearch(search) // Handle Search if null turn to empty string

    let query = supabase
      .from('expenses')
      .select('*, branches( name )')
      .order(column, { ascending: order })

    query = getExpensesFilter(query, { search, branch_id, spent_at })

    // Execute the query
    const { data } = await query

    // Set the retrieved data to state
    expensesReport.value = data
  }

  // Count Expenses
  async function getExpensesCount({ search, branch_id, spent_at }) {
    let query = supabase.from('expenses').select('*', { count: 'exact', head: true })

    query = getExpensesFilter(query, { search, branch_id, spent_at })

    return await query
  }

  // Filter Expenses
  function getExpensesFilter(query, { search, branch_id, spent_at }) {
    if (search) query = query.or('name.ilike.%' + search + '%, description.ilike.%' + search + '%')

    if (branch_id) query = query.eq('branch_id', branch_id)

    if (spent_at) {
      if (spent_at.length === 1) query = query.eq('spent_at', dateShiftFixValue(spent_at[0]))
      else {
        query = query
          .gte('spent_at', dateShiftFixValue(spent_at[0])) // Greater than or equal to `from` date
          .lte('spent_at', dateShiftFixValue(spent_at[spent_at.length - 1])) // Less than or equal to `to` date
      }
    }

    return query
  }

  // Add Expenses
  async function addExpenditure(formData) {
    return await supabase.from('expenses').insert([formData]).select()
  }

  // Update Expenses
  async function updateExpenditure(formData) {
    // eslint-disable-next-line no-unused-vars
    const { branches, ...data } = dateShiftFixForm(formData, ['spent_at'])

    return await supabase.from('expenses').update(data).eq('id', formData.id).select()
  }

  // Delete Expenses
  async function deleteExpenditure(id) {
    return await supabase.from('expenses').delete().eq('id', id)
  }

  return {
    expensesTable,
    expensesReport,
    expensesTotal,
    $reset,
    getExpensesTable,
    getExpensesReport,
    addExpenditure,
    updateExpenditure,
    deleteExpenditure
  }
})
