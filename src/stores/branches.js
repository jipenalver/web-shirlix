import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, tablePagination } from '@/utils/supabase'

export const useBranchesStore = defineStore('branches', () => {
  // States
  const branchesTable = ref([])
  const branches = ref([])

  // Reset State Action
  function $reset() {
    branchesTable.value = []
    branches.value = []
  }

  // Retrieve Branches Table
  async function getBranchesTable(tableOptions, { search }) {
    // Handle Pagination
    const { rangeStart, rangeEnd, column, order } = tablePagination(tableOptions, 'name') // Default Column to be sorted // true = Ascending, false = Descending
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

  // Retrieve Branches
  async function getBranches() {
    // Query Supabase with pagination and sorting
    const { data } = await supabase.from('branches').select().order('name', { ascending: true })

    // Set the retrieved data to state
    branches.value = data
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

  return {
    branchesTable,
    branches,
    $reset,
    getBranchesTable,
    getBranches,
    addBranch,
    updateBranch,
    deleteBranch
  }
})
