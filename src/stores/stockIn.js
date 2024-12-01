import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, tablePagination, tableSearch } from '@/utils/supabase'
import { dateShiftFixForm, dateShiftFixValue } from '@/utils/helpers'
import { useAuthUserStore } from './authUser'

export const useStockInStore = defineStore('stockIn', () => {
  // Use Pinia Store
  const authStore = useAuthUserStore()

  // States
  const stockInTable = ref([])
  const stockInReport = ref([])
  const stockInTotal = ref(0)

  // Reset State Action
  function $reset() {
    stockInTable.value = []
    stockInReport.value = []
    stockInTotal.value = 0
  }

  // Retrieve StockIn Table
  async function getStockInTable(tableOptions, { search, product_id, branch_id, purchased_at }) {
    const { rangeStart, rangeEnd, column, order } = tablePagination(
      tableOptions,
      'purchased_at',
      false
    ) // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true
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

  // Retrieve Stock In Report
  async function getStockInReport(tableOptions, { search, product_id, branch_id, purchased_at }) {
    const { column, order } = tablePagination(tableOptions, 'purchased_at', false) // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true
    search = tableSearch(search) // Handle Search if null turn to empty string

    let query = supabase
      .from('stock_ins')
      .select('*, branches( name ), products( name, image_url, description )')
      .order(column, { ascending: order })

    query = getStockInFilter(query, { search, product_id, branch_id, purchased_at })

    // Execute the query
    const { data } = await query

    // Set the retrieved data to state
    stockInReport.value = data
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
  async function getStockInFilter(query, { search, product_id, branch_id, purchased_at }) {
    if (search) {
      if (search.length >= 4 && !isNaN(search))
        query = query.or('id.eq.' + search + ', stock_in_id.eq.' + search)
      else query = query.or('supplier.ilike.%' + search + '%, remarks.ilike.%' + search + '%')
    }

    if (product_id) query = query.eq('product_id', product_id)

    if (branch_id) query = query.eq('branch_id', branch_id)
    // If branch is not set, get the branch(es) of the user
    else {
      const { data } = await supabase
        .from('branches')
        .select('id')
        .in('name', authStore.userData.branch.split(','))

      query = query.in(
        'branch_id',
        data.map((b) => b.id)
      )
    }

    if (purchased_at) {
      if (purchased_at.length === 1)
        query = query.eq('purchased_at', dateShiftFixValue(purchased_at[0]))
      else {
        query = query
          .gte('purchased_at', dateShiftFixValue(purchased_at[0])) // Greater than or equal to `from` date
          .lte('purchased_at', dateShiftFixValue(purchased_at[purchased_at.length - 1])) // Less than or equal to `to` date
      }
    }

    return query
  }

  // Add StockIn
  async function addStockIn(formData) {
    return await supabase
      .from('stock_ins')
      .insert([{ ...formData, last_updated_id: authStore.userData.id }])
      .select()
  }

  // Update StockIn; if you put arg stockId will assume a customized formData
  async function updateStockIn(formData, stockId = null) {
    let transformedData = {}
    if (stockId) transformedData = formData
    else {
      // eslint-disable-next-line no-unused-vars
      const { branches, products, ...data } = dateShiftFixForm(formData, [
        'purchased_at',
        'expired_at'
      ])
      transformedData = data
    }

    return await supabase
      .from('stock_ins')
      .update({ ...transformedData, last_updated_id: authStore.userData.id })
      .eq('id', stockId ?? formData.id)
      .select()
  }

  // Delete StockIn
  async function deleteStockIn(id) {
    return await supabase.from('stock_ins').delete().eq('id', id)
  }

  // Add Stock Portion
  async function addStockPortion(formData, stockId) {
    const transformedData = formData.map((value) => {
      // eslint-disable-next-line no-unused-vars
      const { product_id, product_preview, qty, ...stockData } = value

      return {
        ...stockData,
        qty: qty,
        qty_reweighed: qty,
        product_id: product_id.id,
        last_updated_id: authStore.userData.id
      }
    })

    // Update segregated status
    await updateStockIn({ is_segregated: true }, stockId)

    return await supabase.from('stock_ins').insert(transformedData).select()
  }

  return {
    stockInTable,
    stockInReport,
    stockInTotal,
    $reset,
    getStockInTable,
    getStockInReport,
    addStockIn,
    updateStockIn,
    deleteStockIn,
    addStockPortion
  }
})
