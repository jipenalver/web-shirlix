import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, tablePagination } from '@/utils/supabase'
import { getRandomCode } from '@/utils/helpers'

export const useCodesStore = defineStore('codes', () => {
  // States
  const codes = ref([])

  // Reset State Action
  function $reset() {
    codes.value = []
  }

  // Retrieve Codes Table
  async function getCodes(tableOptions) {
    const { column, order } = tablePagination(tableOptions, 'id', false) // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true

    // Query Supabase with sorting
    let query = supabase.from('codes').select().eq('is_used', 0).order(column, { ascending: order })

    // Execute the query
    const { data } = await query
    // Set the retrieved data to state
    codes.value = data
  }

  // Add Codes
  async function addCode(formData) {
    const codeData = Array.from({ length: formData.qty }, () => ({
      code: getRandomCode()
    }))

    return await supabase.from('codes').insert(codeData).select()
  }

  // Check Code
  async function checkCode(formData) {
    const { count, error } = await supabase
      .from('codes')
      .select('code', { count: 'exact', head: true })
      .eq('code', formData.code)
      .eq('is_used', 0)

    // Check if it has error or Count is zero
    if (error) return { error }
    if (count == 0)
      return { error: { message: 'Code is either used or does not exist', status: 404 } }

    return await supabase.from('codes').update({ is_used: true }).eq('code', formData.code).select()
  }

  return {
    codes,
    $reset,
    getCodes,
    addCode,
    checkCode
  }
})
