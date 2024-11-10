import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase, tablePagination, tableSearch } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'

export const useBranchesStore = defineStore('branches', () => {
  // Use Pinia Store
  const authStore = useAuthUserStore()

  // States
  const branchesTable = ref([])
  const branches = ref([])
  const branchesTotal = ref(0)

  // Reset State Action
  function $reset() {
    branchesTable.value = []
    branches.value = []
    branchesTotal.value = 0
  }

  // Retrieve Branches Table
  async function getBranchesTable(tableOptions, { search }) {
    const { rangeStart, rangeEnd, column, order } = tablePagination(tableOptions, 'name') // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true
    search = tableSearch(search) // Handle Search if null turn to empty string

    // Query Supabase with pagination and sorting
    const { data } = await supabase
      .from('branches')
      .select()
      .or('name.ilike.%' + search + '%, address.ilike.%' + search + '%')
      .order(column, { ascending: order })
      .range(rangeStart, rangeEnd)

    // Separate query to get the total count without range
    const { count } = await getBranchesCount({ search })

    // Set the retrieved data to state
    branchesTable.value = data
    branchesTotal.value = count
  }

  // Count Branches
  async function getBranchesCount({ search }) {
    return await supabase
      .from('branches')
      .select('*', { count: 'exact', head: true })
      .or('name.ilike.%' + search + '%, address.ilike.%' + search + '%')
  }

  // Retrieve Branches
  async function getBranches() {
    const { data } = await supabase.from('branches').select().order('name', { ascending: true })

    // Filter branches for selection based on auth user
    const authBranches = authStore.userData.branch.split(',')

    // Set the retrieved data to state
    branches.value = data.filter((b) => authBranches.includes(b.name))
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
    branchesTotal,
    $reset,
    getBranchesTable,
    getBranches,
    addBranch,
    updateBranch,
    deleteBranch
  }
})
