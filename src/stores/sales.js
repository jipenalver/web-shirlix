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
  async function addSale() {
    const { data, error } = await supabase
      .from('sales')
      .insert([{ some_column: 'someValue', other_column: 'otherValue' }])
      .select()
  }

  return { stocks, stocksCart, stocksCartTotal, $reset, $resetCart, getStocks, addSale }
})
