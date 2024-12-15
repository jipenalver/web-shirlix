import { supabase, tablePagination, tableSearch } from '@/utils/supabase'
import { dateShiftFixValue } from '@/utils/helpers'
import { useAuthUserStore } from './authUser'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReportsStore = defineStore('reports', () => {
  // Use Pinia Store
  const authStore = useAuthUserStore()

  // States
  const stocksReport = ref([])
  const salesReport = ref([])

  // Reset State Action
  function $reset() {
    stocksReport.value = []
    salesReport.value = []
  }

  // Retrieve Stocks Report
  async function getStocksReport(tableOptions, { search, product_id, branch_id, purchased_at }) {
    const { column, order } = tablePagination(tableOptions, 'purchased_at', false) // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true
    search = tableSearch(search) // Handle Search if null turn to empty string

    let query = supabase
      .from('stock_ins')
      .select('*, branches( name ), products( name, image_url, description )')
      .order(column, { ascending: order })
      .eq('is_portion', true)

    query = getStocksFilter(query, { search, product_id, branch_id, purchased_at })

    // Execute the query
    const { data } = await query

    // Set the retrieved data to state
    stocksReport.value = data
  }

  // Filter Stocks
  async function getStocksFilter(query, { search, product_id, branch_id, purchased_at }) {
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

  // Retrieve Sales
  async function getSalesReport(tableOptions, { customer_id, branch_id, created_at }) {
    const { column, order } = tablePagination(tableOptions, 'created_at', false) // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true

    let query = supabase
      .from('sales')
      .select(
        '*, customers( customer ), branches( name ), sale_products( products(name, image_url), qty, discounted_price, unit_price, is_cash_discount, discount), customer_payments( payment, created_at )'
      )
      .order(column, { ascending: order })

    query = getSalesFilter(query, { customer_id, branch_id, created_at })

    // Execute the query
    const { data } = await query

    // Set the retrieved data to state
    salesReport.value = data
  }

  // Filter Stocks
  async function getSalesFilter(query, { customer_id, branch_id, created_at }) {
    if (customer_id) query = query.eq('customer_id', customer_id)

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

    if (created_at) {
      if (created_at.length === 1) query = query.eq('created_at', dateShiftFixValue(created_at[0]))
      else {
        query = query
          .gte('created_at', dateShiftFixValue(created_at[0])) // Greater than or equal to `from` date
          .lte('created_at', dateShiftFixValue(created_at[created_at.length - 1])) // Less than or equal to `to` date
      }
    }

    return query
  }

  return {
    stocksReport,
    salesReport,
    $reset,
    getStocksReport,
    getSalesReport
  }
})
