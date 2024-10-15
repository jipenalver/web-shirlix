import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export const useUserRolesStore = defineStore('userRoles', () => {
  // States
  const userRoles = ref([])

  // Getters
  // const doubleCount = computed(() => count.value * 2)

  // Retrieve User Roles
  async function getUserRoles() {
    const { data, error } = await supabase.from('user_roles').select()

    // Check if it has error
    if (error) {
      return { error }
    }
    // If no error set updatedData to userData state
    else if (data) {
      userRoles.value = data

      return { data }
    }
  }

  // Add User Roles
  async function addUserRole(formData) {
    const { data, error } = await supabase.from('user_roles').insert([formData]).select()

    // Check if it has error
    if (error) {
      return { error }
    }
    // If no error set updatedData to userData state
    else if (data) {
      return { data }
    }
  }

  return { userRoles, getUserRoles, addUserRole }
})
