import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export const useAuthUserStore = defineStore('authUser', () => {
  // States
  const userData = ref(null)

  // Getters
  // Computed Properties; Use for getting the state but not modifying its reactive state
  // const doubleCount = computed(() => count.value * 2)

  // Reset State Action
  function $reset() {
    userData.value = null
  }

  // Actions
  async function getUserInformation() {
    const {
      data: {
        user: { user_metadata }
      }
    } = await supabase.auth.getUser()

    userData.value = user_metadata
  }

  return { userData, $reset, getUserInformation }
})
