import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabaseAdmin } from '@/utils/supabase'

export const useUsersStore = defineStore('users', () => {
  // States
  const usersTable = ref([])

  // Getters
  // const doubleCount = computed(() => count.value * 2)

  // Reset State Action
  function $reset() {
    usersTable.value = null
  }

  // Actions
  async function getUsers({ page, itemsPerPage }) {
    const {
      data: { users }
    } = await supabaseAdmin.auth.admin.listUsers({
      page: page,
      perPage: itemsPerPage
    })

    usersTable.value = users
  }

  return { usersTable, $reset, getUsers }
})
