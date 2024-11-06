import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, tablePagination, tableSearch } from '@/utils/supabase'

export const useStockInStore = defineStore('stockIn', () => {
  // States
  const stockInTable = ref([])
  const stockInTotal = ref(0)

  // Reset State Action
  function $reset() {
    stockInTable.value = []
    stockInTotal.value = 0
  }

  // Retrieve StockIn Table
  async function getStockInTable(tableOptions, { search }) {
    const { rangeStart, rangeEnd, column, order } = tablePagination(tableOptions, 'purchased_at') // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true
    search = tableSearch(search) // Handle Search if null turn to empty string

    // Query Supabase with pagination and sorting
    let query = supabase
      .from('stock_ins')
      .select('*, branches( name ), products( name, image_url )')
      .or(`supplier.ilike.%${search}%, remarks.ilike.%${search}%`)
      .order(column, { ascending: order })
      .range(rangeStart, rangeEnd)

    // Execute the query
    const { data } = await query

    // Separate query to get the total count without range
    const { count } = await getStockInCount(search)

    // Set the retrieved data to state
    stockInTable.value = data
    stockInTotal.value = count
  }

  // Count StockIn
  async function getStockInCount(search = '') {
    return await supabase
      .from('stock_ins')
      .select('*', { count: 'exact', head: true })
      .or(`supplier.ilike.%${search}%, remarks.ilike.%${search}%`)
  }

  // Add StockIn
  async function addStockIn(formData) {
    return await supabase.from('stock_ins').insert([formData]).select()
  }

  // Update StockIn
  async function updateStockIn(formData) {
    return await supabase.from('stock_ins').update(formData).eq('id', formData.id).select()
  }

  // Delete StockIn
  async function deleteStockIn(id) {
    return await supabase.from('stock_ins').delete().eq('id', id)
  }

  return {
    stockInTable,
    stockInTotal,
    $reset,
    getStockInTable,
    getStockInCount,
    addStockIn,
    updateStockIn,
    deleteStockIn
  }
})
