import { getAccumulatedNumber, getISODate, getPreciseNumber, prepareDate } from '@/utils/helpers'
import { supabase, tablePagination, tableSearch } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReportsStore = defineStore('reports', () => {
  // Use Pinia Store
  const authStore = useAuthUserStore()

  // States
  const productsReport = ref([])
  const stocksReport = ref([])
  const salesReport = ref([])

  // Reset State Action
  function $reset() {
    productsReport.value = []
    stocksReport.value = []
    salesReport.value = []
  }

  // Retrieve Products Report
  async function getProductsReport(tableOptions, { product_id, branch_id, date }) {
    if (!date) return

    let query = supabase
      .from('products')
      .select(
        'id, name, image_url, description, stock_ins( qty_reweighed, qty_metric, branch_id, is_portion, purchased_at ), sale_products( qty, branch_id, created_at )'
      )
      .eq('stock_ins.is_portion', true)
      .order('name', { ascending: true })

    if (branch_id)
      query = query.eq('stock_ins.branch_id', branch_id).eq('sale_products.branch_id', branch_id)

    if (product_id) query = query.eq('id', product_id)

    // Execute the query
    const { data } = await query

    // Set the retrieved data to state
    productsReport.value = getProductsMap(data, { date })
  }

  // Filter Products
  function getProductsMap(data, { date }) {
    // Calculate the previous day's date
    const formatDate = new Date(date)
    formatDate.setDate(formatDate.getDate() - 1)
    const previousDate = getISODate(formatDate)

    // Format the given date to YYYY-MM-DD for comparison
    const todayDate = getISODate(new Date(date))

    // Remapped Date for Table
    const remappedData = data.map((product) => {
      const totalStockIns = getAccumulatedNumber(
        product.stock_ins.filter((stock) => stock.purchased_at <= previousDate),
        'qty_reweighed'
      )
      const totalSales = getAccumulatedNumber(
        product.sale_products.filter((sale) => getISODate(sale.created_at) <= previousDate),
        'qty'
      )
      // Stock in for the specified date
      const stockInDuringDate = getAccumulatedNumber(
        product.stock_ins.filter((stock) => stock.purchased_at === todayDate),
        'qty_reweighed'
      )
      const stockSoldDuringDate = getAccumulatedNumber(
        product.sale_products.filter((sale) => getISODate(sale.created_at) === todayDate),
        'qty'
      )
      const qty_metric = product.stock_ins.length > 0 ? product.stock_ins[0].qty_metric : ''

      return {
        date: todayDate,
        name: product.name,
        image_url: product.image_url,
        description: product.description,
        stock_opening: getPreciseNumber(totalStockIns - totalSales),
        stock_in: stockInDuringDate,
        stock_sold: stockSoldDuringDate,
        stock_remaining: getPreciseNumber(
          totalStockIns - totalSales + stockInDuringDate - stockSoldDuringDate
        ),
        qty_metric
      }
    })

    return remappedData
  }

  // Retrieve Stocks Report
  async function getStocksReport(tableOptions, { search, product_id, branch_id, purchased_at }) {
    const { column, order } = tablePagination(tableOptions, 'created_at', false) // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true
    search = tableSearch(search) // Handle Search if null turn to empty string

    let query = supabase
      .from('stock_ins')
      .select('*, branches( name ), products( name, image_url, description ), sale_products( qty )')
      .order(column, { ascending: order })
      .eq('is_segregated', false)

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
      if (authStore.authBranchIds.length === 0) await authStore.getAuthBranchIds()

      query = query.in('branch_id', authStore.authBranchIds)
    }

    if (purchased_at) {
      if (purchased_at.length === 1) query = query.eq('purchased_at', prepareDate(purchased_at[0]))
      else {
        query = query
          .gte('purchased_at', prepareDate(purchased_at[0])) // Greater than or equal to `from` date
          .lte('purchased_at', prepareDate(purchased_at[purchased_at.length - 1])) // Less than or equal to `to` date
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
      if (authStore.authBranchIds.length === 0) await authStore.getAuthBranchIds()

      query = query.in('branch_id', authStore.authBranchIds)
    }

    if (created_at) {
      if (created_at.length === 1) query = query.eq('created_at', prepareDate(created_at[0]))
      else {
        query = query
          .gte('created_at', prepareDate(created_at[0])) // Greater than or equal to `from` date
          .lte('created_at', prepareDate(created_at[created_at.length - 1])) // Less than or equal to `to` date
      }
    }

    return query
  }

  return {
    productsReport,
    stocksReport,
    salesReport,
    $reset,
    getProductsReport,
    getStocksReport,
    getSalesReport
  }
})
