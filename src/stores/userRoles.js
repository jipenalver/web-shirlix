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
    const { data } = await supabase
      .from('user_roles')
      .select()
      .order('user_role', { ascending: true })

    // Set the retrieved data to state
    userRoles.value = data
  }

  // Add User Roles
  async function addUserRole(formData) {
    return await supabase.from('user_roles').insert([formData]).select()
  }

  // Update User Roles
  async function updateUserRole(formData) {
    return await supabase.from('user_roles').update(formData).eq('id', formData.id).select()
  }

  // Delete User Roles
  async function deleteUserRole(id) {
    return await supabase.from('user_roles').delete().eq('id', id)
  }

  return { userRoles, $reset, getUserRoles, addUserRole, updateUserRole, deleteUserRole }
})
