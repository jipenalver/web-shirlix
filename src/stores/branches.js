import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, tablePagination } from '@/utils/supabase'

export const useBranchesStore = defineStore('branches', () => {
  // States
  const branchesTable = ref([])

  // Getters
  // const doubleCount = computed(() => count.value * 2)

  // Reset State Action
  function $reset() {
    branchesTable.value = []
  }

  // Retrieve Branches
  async function getBranches({ page, itemsPerPage, sortBy }, { search }) {
    // Handle Pagination
    const { rangeStart, rangeEnd, column, order } = tablePagination(
      page,
      itemsPerPage,
      sortBy,
      'name',
      true
    )
    // Handle Search if null turn to empty string
    search = search || ''

    // Query Supabase with pagination and sorting
    const { data } = await supabase
      .from('branches')
      .select()
      .or('name.ilike.%' + search + '%, address.ilike.%' + search + '%')
      .order(column, { ascending: order })
      .range(rangeStart, rangeEnd)

    // Set the retrieved data to state
    branchesTable.value = data
  }

  // Add Branches
  async function addBranch(formData) {
    return await supabase.from('branches').insert([formData]).select()
  }

  // Update Branches
  async function updateBranch(formData) {
    return await supabase.from('branches').update(formData).eq('id', formData.id).select()
  }

  // Delete Branches
  async function deleteBranch(id) {
    return await supabase.from('branches').delete().eq('id', id)
  }

  return { branchesTable, $reset, getBranches, addBranch, updateBranch, deleteBranch }
})
