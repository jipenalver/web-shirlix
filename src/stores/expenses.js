import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, tablePagination, tableSearch } from '@/utils/supabase'
import { dateShiftFixForm, dateShiftFixValue } from '@/utils/helpers'
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
    expensesReport.value = []
  }

  // Retrieve Expenses Table
  async function getExpensesTable(tableOptions, { search, branch_id }) {
    const { rangeStart, rangeEnd, column, order } = tablePagination(tableOptions, 'name') // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true
    search = tableSearch(search) // Handle Search if null turn to empty string

    // Query Supabase with pagination and sorting
    let query = supabase
      .from('expenses')
      .select('*, branches( name )')
      .or('name.ilike.%' + search + '%, description.ilike.%' + search + '%')
      .order(column, { ascending: order })
      .range(rangeStart, rangeEnd)

    if (branch_id) {
      query = query.eq('branch_id', branch_id)
    }

    // Execute the query
    const { data } = await query

    // Set the retrieved data to state
    expensesTable.value = data
  }

  // Retrieve Expenses Report
  async function getExpensesReport(tableOptions, { search, branch_id, spent_at }) {
    const { column, order } = tablePagination(tableOptions, 'name') // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true
    search = tableSearch(search) // Handle Search if null turn to empty string

    let query = supabase
      .from('expenses')
      .select('*, branches( name )')
      .or('name.ilike.%' + search + '%, description.ilike.%' + search + '%')
      .order(column, { ascending: order })

    if (branch_id) {
      query = query.eq('branch_id', branch_id)
    }

    if (spent_at) {
      if (spent_at.length === 1)
        query = query.eq('spent_at', dateShiftFixValue(date, spent_at[0]).toISOString())
      else {
        query = query
          .gte('spent_at', dateShiftFixValue(date, spent_at[0]).toISOString()) // Greater than or equal to `from` date
          .lte('spent_at', spent_at[spent_at.length - 1].toISOString()) // Less than or equal to `to` date
      }
    }

    // Execute the query
    const { data } = await query

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
    const { branches, ...data } = dateShiftFixForm(date, formData, ['spent_at'])

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
