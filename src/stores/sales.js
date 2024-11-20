import { defineStore } from 'pinia'
import { supabase, tableSearch } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'
import { ref } from 'vue'

export const useSalesStore = defineStore('sales', () => {
  // Use Pinia Store
  const authStore = useAuthUserStore()

  // States
  const stocks = ref([])

  // Retrieve StockIn Table
  async function getStocks({ search }) {
    search = tableSearch(search) // Handle Search if null turn to empty string

    let query = supabase
      .from('stock_ins')
      .select('*, branches( name ), products( name, image_url, description )')
      .order('name', { referencedTable: 'products', ascending: true })
      .eq('is_portion', true)

    query = getStockFilter(query, { search })

    // Execute the query
    const { data } = await query

    // Set the retrieved data to state
    stocks.value = data
  }

  // Filter Stocks
  async function getStockFilter(query, { search }) {
    if (search) {
      if (search.length >= 4 && !isNaN(search))
        query = query.or('id.eq.' + search + ', stock_in_id.eq.' + search)
      else
        query = query.or('name.ilike.%' + search + '%, description.ilike.%' + search + '%', {
          referencedTable: 'products'
        })
    }

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

  return { stocks, getStocks }
})
