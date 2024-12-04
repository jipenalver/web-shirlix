import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'
import { computed, ref } from 'vue'
import { isEmpty } from '@/utils/validators'

export const useSalesStore = defineStore('sales', () => {
  // Use Pinia Store
  const authStore = useAuthUserStore()

  // States
  const salesReport = ref([])
  const customers = ref([])
  const stocks = ref([])
  const stocksCart = ref(
    localStorage.getItem('stocksCart') ? JSON.parse(localStorage.getItem('stocksCart')) : []
  )

  // Getters
  const stocksCartTotal = computed(() => {
    return stocksCart.value.reduce((acc, item) => acc + item.discounted_price, 0)
  })

  // Reset State Stocks
  function $reset() {
    stocks.value = []
  }

  // Reset State Cart
  function $resetCart() {
    stocksCart.value = []
    localStorage.removeItem('stocksCart')
  }

  // Reset State Stocks
  function $resetReport() {
    salesReport.value = []
  }

  // Retrieve Stocks Table
  async function getStocks({ branch_id }) {
    let query = supabase
      .from('stock_ins')
      .select('*, products( name, image_url )')
      .order('name', { referencedTable: 'products', ascending: true })
      .order('id', { ascending: true })
      .eq('is_portion', true)

    query = getStockFilter(query, { branch_id })

    // Execute the query
    const { data } = await query

    // Set the retrieved data to state
    stocks.value = data
  }

  // Filter Stocks
  async function getStockFilter(query, { branch_id }) {
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

  // Get Customers
  async function getCustomers() {
    const { data } = await supabase
      .from('customers')
      .select()
      .order('customer', { ascending: true })

    customers.value = data
  }

  // Get Sales
  async function getSales() {
    const { data } = await supabase
      .from('sales')
      .select('*, sale_products(*, products(name, image_url))')
      .order('created_at', { ascending: false })

    console.log(data)
  }

  // Add Sales
  async function addSales(formData) {
    const { stocks, customer, ...salesData } = formData

    // Check if new customer
    let customer_id = null
    if (typeof customer === 'string' && !isEmpty(customer)) {
      const { data } = await supabase.from('customers').insert([{ customer }]).select()

      customer_id = data[0].id
    }
    // Check if it is customer id
    else if (typeof customer === 'number') customer_id = customer

    // Add Sale Report
    const { data } = await supabase
      .from('sales')
      .insert([{ ...salesData, user_id: authStore.userData.id, customer_id }])
      .select()

    // Re-mapped Sold Products
    const stockFormData = stocks.map((stock) => {
      return {
        qty: stock.qty,
        total_price: stock.total_price,
        is_cash_discount: stock.is_cash_discount,
        discount: stock.discount,
        discounted_price: stock.discounted_price,
        product_id: stock.product.product_id,
        sale_id: data[0].id
      }
    })

    // Add Sold Products
    return await supabase.from('sale_products').insert(stockFormData).select()
  }

  return {
    stocks,
    stocksCart,
    stocksCartTotal,
    salesReport,
    customers,
    $reset,
    $resetCart,
    $resetReport,
    getStocks,
    getCustomers,
    getSales,
    addSales
  }
})
