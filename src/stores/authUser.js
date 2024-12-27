import { supabase } from '@/utils/supabase'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthUserStore = defineStore('authUser', () => {
  // States
  const userData = ref(null)
  const authPages = ref([])
  const authBranchIds = ref([])

  // Getters
  // Computed Properties; Use for getting the state but not modifying its reactive state
  const userRole = computed(() => {
    return userData.value?.is_admin ? 'Super Administrator' : userData.value.user_role
  })

  // Reset State Action
  function $reset() {
    userData.value = null
    authPages.value = []
    authBranchIds.value = []
  }

  // Actions
  // Retrieve User Session if Logged
  async function isAuthenticated() {
    const { data } = await supabase.auth.getSession()

    if (data.session) {
      const { id, email, user_metadata } = data.session.user
      userData.value = { id, email, ...user_metadata }
    }

    return !!data.session
  }

  // Retrieve User Information
  async function getUserInformation() {
    const {
      data: {
        // Retrieve Id, Email and Metadata thru Destructuring
        user: { id, email, user_metadata }
      }
    } = await supabase.auth.getUser()

    // Set the retrieved information to state
    userData.value = { id, email, ...user_metadata }
  }

  // Retrieve User Roles Pages
  async function getAuthPages(name) {
    const { data } = await supabase
      .from('user_roles')
      .select('*, pages: user_role_pages (page)')
      .eq('user_role', name)

    // Set the retrieved data to state
    if (data.length > 0) authPages.value = data[0].pages.map((p) => p.page)
  }

  // Retrieve Branch Ids
  async function getAuthBranchIds() {
    const { data } = await supabase
      .from('branches')
      .select('id')
      .in('name', userData.value.branch.split(','))

    authBranchIds.value = data.map((b) => b.id)
  }

  // Update User Information
  async function updateUserInformation(updatedData) {
    const {
      data: {
        // Retrieve Id, Email and Metadata thru Destructuring
        user: { id, email, user_metadata }
      },
      error
    } = await supabase.auth.updateUser({
      data: {
        ...updatedData
      }
    })

    // Check if it has error
    if (error) {
      return { error }
    }
    // If no error set updatedData to userData state
    else if (user_metadata) {
      userData.value = { id, email, ...user_metadata }

      return { data: userData.value }
    }
  }

  // Update User Profile Image
  async function updateUserImage(file) {
    // Get the file extension from the uploaded file
    // const fileExtension = file.name.split('.').pop()

    // Upload the file with the user ID and file extension
    const { data, error } = await supabase.storage
      .from('shirlix')
      .upload('avatars/' + userData.value.id + '-avatar.png', file, {
        cacheControl: '3600',
        upsert: true
      })

    // Check if it has error
    if (error) {
      return { error }
    }
    // If no error set data to userData state with the image_url
    else if (data) {
      // Retrieve Image Public Url
      const { data: imageData } = supabase.storage.from('shirlix').getPublicUrl(data.path)

      // Update the user information with the new image_url
      return await updateUserInformation({ ...userData.value, image_url: imageData.publicUrl })
    }
  }

  return {
    userData,
    userRole,
    authPages,
    authBranchIds,
    $reset,
    isAuthenticated,
    getUserInformation,
    getAuthPages,
    getAuthBranchIds,
    updateUserInformation,
    updateUserImage
  }
})
