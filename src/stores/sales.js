import { getAccumulatedNumber, getPreciseNumber } from '@/utils/helpers'
import { supabase, tableSearch } from '@/utils/supabase'
import { isEmpty, isObject } from '@/utils/validators'
import { useAuthUserStore } from './authUser'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useSalesStore = defineStore('sales', () => {
  // Use Pinia Store
  const authStore = useAuthUserStore()

  // States
  const customers = ref([])
  const stocks = ref([])
  const stocksBase = ref([])
  const stocksCart = ref(
    localStorage.getItem('stocksCart') ? JSON.parse(localStorage.getItem('stocksCart')) : []
  )

  // Getters
  const stocksCartTotal = computed(() => getAccumulatedNumber(stocksCart.value, 'discounted_price'))
  const stocksExactTotal = computed(() => getAccumulatedNumber(stocksCart.value, 'total_price'))

  // Reset State Stocks
  function $reset() {
    stocks.value = []
    stocksBase.value = []
  }

  // Reset State Cart
  function $resetCart() {
    stocksCart.value = []
    localStorage.removeItem('stocksCart')
  }

  // Retrieve Stocks Table
  async function getStocks({ search, branch_id }) {
    let query = supabase
      .from('stock_ins')
      .select('*, products( name, image_url ), sale_products( qty )')
      .order('purchased_at', { ascending: false })
      .eq('is_portion', true)

    query = getStockFilter(query, { branch_id })

    // Execute the query
    const { data } = await query

    // Get a stock reference for the cart checking
    stocksBase.value = data

    // Process stocks
    const updateStockQty = (stock) => {
      const cartItems = stocksCart.value.filter((cart) => cart.product.id === stock.id)
      const cartQty = getAccumulatedNumber(cartItems, 'qty')

      return cartQty > 0
        ? { ...stock, qty_reweighed: getPreciseNumber(stock.qty_reweighed - cartQty) }
        : stock
    }
    const processedStocks = stocksCart.value.length > 0 ? data.map(updateStockQty) : data

    // Filter and deduplicate stocks
    const getRemainingQty = (item) =>
      getPreciseNumber(item.qty_reweighed - getAccumulatedNumber(item.sale_products, 'qty'))
    const getStockKey = (item) => `${item.product_id}|${item.unit_price}|${item.unit_price_metric}`
    const filterBySearchAndQty = (item) => {
      const nameMatches = item.products.name
        .toLowerCase()
        .includes(tableSearch(search).toLowerCase())
      const hasStock = getRemainingQty(item) > 0
      return nameMatches && hasStock
    }
    const filteredStocks = processedStocks.filter(filterBySearchAndQty).reduce((unique, item) => {
      const key = getStockKey(item)
      return unique.has(key) ? unique : unique.set(key, item)
    }, new Map())

    // Sort and store results
    stocks.value = Array.from(filteredStocks.values()).sort((a, b) =>
      a.products.name.toLowerCase().localeCompare(b.products.name.toLowerCase())
    )
  }

  // Filter Stocks
  async function getStockFilter(query, { branch_id }) {
    if (branch_id) query = query.eq('branch_id', branch_id)
    // If branch is not set, get the branch(es) of the user
    else {
      if (authStore.authBranchIds.length === 0) await authStore.getAuthBranchIds()

      query = query.in('branch_id', authStore.authBranchIds)
    }

    return query
  }

  // Get Customers
  async function getCustomers() {
    const { data } = await supabase
      .from('customers')
      .select()
      .order('customer', { ascending: true })

    customers.value = data
  }

  // Add Sales
  async function addSales(formData) {
    const { stocks, customer, payment, ...salesData } = formData

    // Check if object, existing customer
    let customer_id = null
    if (isObject(customer)) customer_id = customer.id
    // Check if string, new customer
    else if (!isEmpty(customer)) {
      const { data } = await supabase.from('customers').insert([{ customer }]).select()
      customer_id = data[0].id
    }

    // Add Sale Report
    const { data } = await supabase
      .from('sales')
      .insert([
        {
          ...salesData,
          user_id: authStore.userData.id,
          customer_id,
          branch_id: stocks[0].product.branch_id
        }
      ])
      .select()

    const sale_id = data[0].id

    // Re-mapped Sold Products
    const stockFormData = stocks.map((stock) => {
      return {
        qty: stock.qty,
        total_price: stock.total_price,
        is_cash_discount: stock.is_cash_discount,
        discount: stock.discount,
        discounted_price: stock.discounted_price,
        product_id: stock.product.product_id,
        unit_price: stock.product.unit_price,
        stock_in_id: stock.product.id,
        branch_id: stock.product.branch_id,
        sale_id
      }
    })

    // Add Payment if partial amount
    if (payment)
      await supabase.from('customer_payments').insert([{ sale_id, customer_id, payment }]).select()

    // Add Sold Products
    return await supabase.from('sale_products').insert(stockFormData).select()
  }

  // Add Payment
  async function addPayment(formData) {
    return await supabase.from('customer_payments').insert([formData]).select()
  }

  return {
    stocks,
    stocksBase,
    stocksCart,
    stocksCartTotal,
    stocksExactTotal,
    customers,
    $reset,
    $resetCart,
    getStocks,
    getCustomers,
    addSales,
    addPayment
  }
})
