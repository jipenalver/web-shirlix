import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'

export const useUserRolesStore = defineStore('userRoles', () => {
  // States
  const userRoles = ref([])

  // Reset State Action
  function $reset() {
    userRoles.value = []
  }

  // Retrieve User Roles
  async function getUserRoles() {
    const { data } = await supabase
      .from('user_roles')
      .select('*, pages: user_role_pages (page)')
      .order('user_role', { ascending: true })

    // Set the retrieved data to state
    userRoles.value = data
  }

  // Add User Roles
  async function addUserRole(formData) {
    const { pages, ...roleData } = formData

    const { data, error } = await supabase.from('user_roles').insert([roleData]).select()

    await updateUserRolePages(data[0].id, pages)

    return { data, error }
  }

  // Update User Roles
  async function updateUserRole(formData) {
    const { pages, ...roleData } = formData

    const { data, error } = await supabase
      .from('user_roles')
      .update(roleData)
      .eq('id', roleData.id)
      .select()

    await updateUserRolePages(formData.id, pages)

    return { data, error }
  }

  // Delete User Roles
  async function deleteUserRole(id) {
    return await supabase.from('user_roles').delete().eq('id', id)
  }

  // Update User Roles Pages
  async function updateUserRolePages(id, pages) {
    const { error: deleteError } = await supabase
      .from('user_role_pages')
      .delete()
      .eq('user_role_id', id)

    if (deleteError) return { error: deleteError }

    const pageData = pages.map((page) => ({ page, user_role_id: id }))

    const { data, error: insertError } = await supabase
      .from('user_role_pages')
      .insert(pageData)
      .select()

    return { data, error: insertError }
  }

  return { userRoles, $reset, getUserRoles, addUserRole, updateUserRole, deleteUserRole }
})
