import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export const useUserRolesStore = defineStore('userRoles', () => {
  // States
  const userRoles = ref(null)

  // Getters
  // const doubleCount = computed(() => count.value * 2)

  // Reset State Action
  function $reset() {
    userRoles.value = null
  }

  // Retrieve User Roles
  async function getUserRoles() {
    const { data } = await supabase.from('user_roles').select()

    // Set the retrieved data to state
    userRoles.value = data
  }

  // Add User Roles
  async function addUserRole(formData) {
    return await supabase.from('user_roles').insert([formData]).select()
  }

  return { userRoles, $reset, getUserRoles, addUserRole }
})
