import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, tablePagination } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'

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
  async function getStocksReport(tableOptions, { product_id, branch_id }) {
    const { column, order } = tablePagination(tableOptions, 'purchased_at', false) // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true

    let query = supabase
      .from('stock_ins')
      .select('*, branches( name ), products( name, image_url, description )')
      .order(column, { ascending: order })

    query = getStocksFilter(query, { product_id, branch_id })

    // Execute the query
    const { data } = await query

    // Set the retrieved data to state
    stocksReport.value = data
  }

  // Filter Stocks
  async function getStocksFilter(query, { product_id, branch_id }) {
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

    return query
  }

  // Retrieve Sales
  async function getSalesReport() {
    const { data } = await supabase
      .from('sales')
      .select('*, sale_products(*, products(name, image_url))')
      .order('created_at', { ascending: false })

    salesReport.value = data
  }

  return {
    stocksReport,
    salesReport,
    $reset,
    getStocksReport,
    getSalesReport
  }
})
