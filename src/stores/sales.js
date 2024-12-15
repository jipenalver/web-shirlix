import { useAuthUserStore } from './authUser'
import { isEmpty } from '@/utils/validators'
import { supabase } from '@/utils/supabase'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useSalesStore = defineStore('sales', () => {
  // Use Pinia Store
  const authStore = useAuthUserStore()

  // States
  const customers = ref([])
  const stocks = ref([])
  const stocksCart = ref(
    localStorage.getItem('stocksCart') ? JSON.parse(localStorage.getItem('stocksCart')) : []
  )

  // Getters
  const stocksCartTotal = computed(() => {
    return stocksCart.value.reduce((acc, item) => acc + item.discounted_price, 0)
  })
  const stocksExactTotal = computed(() => {
    return stocksCart.value.reduce((acc, item) => acc + item.total_price, 0)
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

  // Retrieve Stocks Table
  async function getStocks({ branch_id }) {
    let query = supabase
      .from('stock_ins')
      .select('*, products( name, image_url ), sale_products( qty )')
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

  // Add Sales
  async function addSales(formData) {
    const { stocks, customer, payment, ...salesData } = formData

    // Check if new customer
    let customer_id = null
    if (typeof customer === 'string' && !isEmpty(customer.trim())) {
      const { data } = await supabase.from('customers').insert([{ customer }]).select()

      customer_id = data[0].id
    }
    // Check if it is customer id
    else if (typeof customer === 'number') customer_id = customer

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
        stock_in_id: stock.id,
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
