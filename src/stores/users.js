import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabaseAdmin } from '@/utils/supabase'

export const useUsersStore = defineStore('users', () => {
  // States
  const usersTable = ref([])
  const usersTotal = ref(0)

  // Reset State Action
  function $reset() {
    usersTable.value = []
    usersTotal.value = 0
  }

  // Retrieve Users
  async function getUsersTable({ page, itemsPerPage }) {
    const {
      data: { users, total }
    } = await supabaseAdmin.auth.admin.listUsers({
      page: page,
      perPage: itemsPerPage
    })

    // Set the retrieved data to state
    usersTable.value = users
    usersTotal.value = total
  }

  // Add User
  async function addUser(formData) {
    // eslint-disable-next-line no-unused-vars
    const { password, ...userMetadata } = formData

    return await supabaseAdmin.auth.admin.createUser({
      email: formData.email,
      email_confirm: true,
      password: formData.password,
      user_metadata: { ...userMetadata }
    })
  }

  // Update User
  async function updateUser(formData) {
    // eslint-disable-next-line no-unused-vars
    const { email, password, ...userMetadata } = formData

    return await supabaseAdmin.auth.admin.updateUserById(formData.id, {
      user_metadata: { ...userMetadata }
    })
  }

  // Delete User
  async function deleteUser(id) {
    return await supabaseAdmin.auth.admin.deleteUser(id)
  }

  return { usersTable, usersTotal, $reset, getUsersTable, addUser, updateUser, deleteUser }
})
