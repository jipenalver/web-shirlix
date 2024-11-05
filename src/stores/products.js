import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, tablePagination, tableSearch } from '@/utils/supabase'
import { getSlugText } from '@/utils/helpers'

export const useProductsStore = defineStore('products', () => {
  // States
  const productsTable = ref([])

  // Reset State Action
  function $reset() {
    productsTable.value = []
  }

  // Retrieve Products Table
  async function getProductsTable(tableOptions, { search }) {
    const { rangeStart, rangeEnd, column, order } = tablePagination(tableOptions, 'name') // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true
    search = tableSearch(search) // Handle Search if null turn to empty string

    // Query Supabase with pagination and sorting
    let query = supabase
      .from('products')
      .select()
      .or('name.ilike.%' + search + '%, description.ilike.%' + search + '%')
      .order(column, { ascending: order })
      .range(rangeStart, rangeEnd)

    // Execute the query
    const { data } = await query

    // Set the retrieved data to state
    productsTable.value = data
  }

  // Add Products
  async function addProduct(formData) {
    if (formData.image) {
      const image_url = this.updateProductImage(formData.image, formData.name)
      formData.image_url = image_url
    }

    return await supabase.from('products').insert([formData]).select()
  }

  // Update Products
  async function updateProduct(formData) {
    if (formData.image) {
      const image_url = this.updateProductImage(formData.image, formData.name)
      formData.image_url = image_url
    }

    return await supabase.from('products').update(formData).eq('id', formData.id).select()
  }

  // Delete Products
  async function deleteProduct(id) {
    return await supabase.from('products').delete().eq('id', id)
  }

  // Update Product Image
  // eslint-disable-next-line no-unused-vars
  async function updateProductImage(file, filename) {
    // Upload the file with the user ID and file extension
    const { data } = await supabase.storage
      .from('shirlix')
      .upload('products/' + getSlugText(filename) + '.png', file, {
        cacheControl: '3600',
        upsert: true
      })

    // If no error set data to userData state with the image_url
    if (data) {
      // Retrieve Image Public Url
      const { data: imageData } = supabase.storage.from('shirlix').getPublicUrl(data.path)

      return imageData.publicUrl
    }
  }

  return {
    productsTable,
    $reset,
    getProductsTable,
    addProduct,
    updateProduct,
    deleteProduct
  }
})
