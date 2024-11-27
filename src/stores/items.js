import { supabase, tableSearch } from '@/utils/supabase'
import { getSlugText } from '@/utils/helpers'
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
    if (data) await getItems({ search: '' })
  }

  // Retrieve from Supabase
  async function getItems({ search }) {
    search = tableSearch(search)

    // Display all items, applied sorting and search filter
    const { data } = await supabase
      .from('items')
      .select('*')
      .order('name', { ascending: true })
      .ilike('name', '%' + search + '%')

    // Set response data to state
    items.value = data
  }

  // Add Item
  async function addItem(formData) {
    // Check if there is image uploaded in form
    if (formData.image) {
      // Upload image in supabase and get url
      formData.image_url = await updateItemImage(formData.image, formData.name)
      delete formData.image
    }

    // Insert form data in table
    return await supabase.from('items').insert([formData]).select()
  }

  // Update Item
  async function updateItem(formData) {
    // Check if there is image uploaded in form
    if (formData.image) {
      // Upload image in supabase and get url
      formData.image_url = await updateItemImage(formData.image, formData.name)
      delete formData.image
    }

    // Update form data in table
    return await supabase.from('items').update(formData).eq('id', formData.id).select()
  }

  // Delete Item
  async function deleteItem(id) {
    return await supabase.from('items').delete().eq('id', id)
  }

  // Update Item Image
  async function updateItemImage(file, filename) {
    // Upload the file with the file name and file extension
    const { data } = await supabase.storage
      .from('sample')
      .upload('items/' + getSlugText(filename) + '.png', file, {
        cacheControl: '3600',
        upsert: true
      })

    // If no error set data to userData state with the image_url
    if (data) {
      // Retrieve Image Public Url
      const { data: imageData } = supabase.storage.from('sample').getPublicUrl(data.path)
      return imageData.publicUrl
    }
  }

  return { itemsFromApi, items, $reset, getItemsFromApi, getItems, addItem, updateItem, deleteItem }
})
