import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'
import { computed, ref } from 'vue'

export const useSalesStore = defineStore('sales', () => {
  // Use Pinia Store
  const authStore = useAuthUserStore()

  // States
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

  // Retrieve Stocks Table
  async function getStocks() {
    let query = supabase
      .from('stock_ins')
      .select('*, products( name, image_url )')
      .order('name', { referencedTable: 'products', ascending: true })
      .eq('is_portion', true)

    query = getStockFilter(query)

    // Execute the query
    const { data } = await query

    // Set the retrieved data to state
    stocks.value = data
  }

  // Filter Stocks
  async function getStockFilter(query) {
    const { data } = await supabase
      .from('branches')
      .select('id')
      .in('name', authStore.userData.branch.split(','))

    query = query.in(
      'branch_id',
      data.map((b) => b.id)
    )

    return query
  }

  // Add Sales
  async function addSales(formData) {
    const { stocks, ...salesData } = formData

    // Add Sale Report
    const { data } = await supabase
      .from('sales')
      .insert([{ ...salesData, user_id: authStore.userData.id }])
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

  return { stocks, stocksCart, stocksCartTotal, $reset, $resetCart, getStocks, addSales }
})
