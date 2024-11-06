import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, tablePagination, tableSearch } from '@/utils/supabase'
import { dateShiftFixForm, dateShiftFixValue } from '@/utils/helpers'
import { useDate } from 'vuetify'

export const useStockInStore = defineStore('stockIn', () => {
  // Utilize pre-defined vue functions
  const date = useDate()

  // States
  const stockInTable = ref([])
  const stockInTotal = ref(0)

  // Reset State Action
  function $reset() {
    stockInTable.value = []
    stockInTotal.value = 0
  }

  // Retrieve StockIn Table
  async function getStockInTable(tableOptions, { search, product_id, branch_id, purchased_at }) {
    const { rangeStart, rangeEnd, column, order } = tablePagination(tableOptions, 'purchased_at') // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true
    search = tableSearch(search) // Handle Search if null turn to empty string

    // Query Supabase with pagination and sorting
    let query = supabase
      .from('stock_ins')
      .select('*, branches( name ), products( name, image_url, description )')
      .order(column, { ascending: order })
      .range(rangeStart, rangeEnd)

    query = getStockInFilter(query, { search, product_id, branch_id, purchased_at })

    // Execute the query
    const { data } = await query

    // Separate query to get the total count without range
    const { count } = await getStockInCount({ search, product_id, branch_id, purchased_at })

    // Set the retrieved data to state
    stockInTable.value = data
    stockInTotal.value = count
  }

  // Count StockIn
  async function getStockInCount({ search, product_id, branch_id, purchased_at }) {
    let query = supabase
      .from('stock_ins')
      .select('*, branches( name ), products( name )', { count: 'exact', head: true })

    query = getStockInFilter(query, { search, product_id, branch_id, purchased_at })

    return await query
  }

  // Filter StockIn
  function getStockInFilter(query, { search, product_id, branch_id, purchased_at }) {
    if (search) {
      query = query
        .or('name.ilike.%' + search + '%', { referencedTable: 'products' })
        .or('supplier.ilike.%' + search + '%')
    }

    if (product_id) query = query.eq('product_id', product_id)

    if (branch_id) query = query.eq('branch_id', branch_id)

    if (purchased_at) {
      if (purchased_at.length === 1)
        query = query.eq('purchased_at', dateShiftFixValue(date, purchased_at[0]).toISOString())
      else {
        query = query
          .gte('purchased_at', dateShiftFixValue(date, purchased_at[0]).toISOString()) // Greater than or equal to `from` date
          .lte('purchased_at', purchased_at[purchased_at.length - 1].toISOString()) // Less than or equal to `to` date
      }
    }

    return query
  }

  // Add StockIn
  async function addStockIn(formData) {
    return await supabase.from('stock_ins').insert([formData]).select()
  }

  // Update StockIn
  async function updateStockIn(formData) {
    // eslint-disable-next-line no-unused-vars
    const { branches, products, ...data } = dateShiftFixForm(date, formData, ['purchased_at'])

    return await supabase.from('stock_ins').update(data).eq('id', formData.id).select()
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
    addStockIn,
    updateStockIn,
    deleteStockIn
  }
})
