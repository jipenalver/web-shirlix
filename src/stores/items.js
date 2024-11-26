import { supabase } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'
import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'

export const useItemsStore = defineStore('items', () => {
  // Use Pinia Store
  const authStore = useAuthUserStore()

  // States
  const itemsFromApi = ref([])
  const items = ref([])

  // Reset States
  function $reset() {
    itemsFromApi.value = []
    items.value = []
  }

  // Getters; Real world example of Getters is in authUser.js
  // const sample = computed(() => count.value * 2)

  // Actions
  // Retrieve from Api and reset items table in Supabase
  async function getItemsFromApi() {
    const response = await axios.get('https://api.restful-api.dev/objects')

    // Set response data to state
    itemsFromApi.value = response.data

    // Delete All rows from items table
    await supabase.from('items').delete().neq('id', 0)

    // Re-map/restructure array of objects to fit the items table's columns
    const transformedData = itemsFromApi.value.map((item) => {
      return {
        name: item.name,
        description: item.data?.description ?? '',
        price: item.data?.price ?? 0,
        user_id: authStore.userData.id
      }
    })

    // Insert multiple rows from the re-mapped array of objects
    const { data } = await supabase.from('items').insert(transformedData).select()

    // Trigger get Items actions
    if (data) await getItems()
  }

  // Retrieve from Supabase
  async function getItems() {
    const { data } = await supabase.from('items').select('*')

    items.value = data
  }

  return { itemsFromApi, items, $reset, getItemsFromApi, getItems }
})
