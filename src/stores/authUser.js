import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export const useAuthUserStore = defineStore('authUser', () => {
  // States
  const userData = ref(null)

  // Getters
  // Computed Properties; Use for getting the state but not modifying its reactive state
  const userRole = computed(() => {
    return userData.value?.is_admin ? 'Administrator' : 'User'
  })

  // Reset State Action
  function $reset() {
    userData.value = null
  }

  // Actions
  // Retrieve User Information
  async function getUserInformation() {
    const {
      data: {
        user: { email, user_metadata }
      }
    } = await supabase.auth.getUser()

    // Set the retrieved information to userData state
    userData.value = { email, ...user_metadata }
  }

  async function updateUserInformation(updatedData) {
    const {
      data: {
        user: { email, user_metadata }
      },
      error
    } = await supabase.auth.updateUser({
      data: {
        ...updatedData
      }
    })

    // Check if it has error; if not set data to userData state
    if (error) {
      return { success: false, error }
    } else if (user_metadata) {
      userData.value = { email, ...user_metadata }
      return { success: true, data: userData.value }
    }
  }

  return { userData, userRole, $reset, getUserInformation, updateUserInformation }
})
