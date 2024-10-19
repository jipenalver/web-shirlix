<script setup>
import { useDate } from 'vuetify'
import { useUsersStore } from '@/stores/users'
import { ref } from 'vue'

// Utilize
const date = useDate()

// Table Headers
const tableHeaders = [
  {
    title: 'Email',
    key: 'email',
    sortable: false,
    align: 'start'
  },
  {
    title: 'Fullname',
    key: 'lastname',
    sortable: false,
    align: 'start'
  },
  {
    title: 'Role',
    key: 'user_role',
    sortable: false,
    align: 'start'
  },
  {
    title: 'Registered Date',
    key: 'created_at',
    sortable: false,
    align: 'end'
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    align: 'center'
  }
]

// Use Pinia Store
const usersStore = useUsersStore()

// Load Variables
const tableData = ref({
  items: [],
  itemsLength: 0,
  itemsPerPage: 5,
  isLoading: false
})
const tableFilters = ref({
  search: '',
  user_role: null
})

// Load Tables Data
const loadItems = async ({ page, itemsPerPage, sortBy }) => {
  // Trigger Loading
  tableData.value.isLoading = true

  // Load Users
  await usersStore.getUsers({ page, itemsPerPage, sortBy })

  // Table Datas
  tableData.value.items = usersStore.usersTable
  tableData.value.itemsLength = usersStore.usersTable.length

  // Trigger Loading
  tableData.value.isLoading = false
}
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-data-table-server
        v-model:items-per-page="tableData.itemsPerPage"
        :items="tableData.items"
        :items-length="tableData.itemsLength"
        :loading="tableData.isLoading"
        :headers="tableHeaders"
        @update:options="loadItems"
      >
        <template #top>
          <v-row dense>
            <v-spacer></v-spacer>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="tableFilters.name"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                placeholder="Search"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="2">
              <v-btn
                class="my-1"
                prepend-icon="mdi-account-plus"
                color="deep-orange-lighten-1"
                block
              >
                Add User
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-5"></v-divider>
        </template>

        <template #item.lastname="{ item }">
          {{ item.user_metadata.lastname }}, {{ item.user_metadata.firstname }}
        </template>

        <template #item.user_role="{ item }">
          {{ item.user_metadata.user_role }}
        </template>

        <template #item.created_at="{ item }">
          {{ date.format(item.created_at, 'fullDateTime') }}
        </template>

        <template #item.actions="{ item }">
          <v-btn variant="text">
            <v-icon icon="mdi-pencil" size="large" color="deep-orange-lighten-1"></v-icon>
            <v-tooltip activator="parent" location="top">Edit User</v-tooltip>
          </v-btn>

          <v-btn variant="text">
            <v-icon icon="mdi-trash-can"></v-icon>
            <v-tooltip activator="parent" location="top">Delete User</v-tooltip>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>
</template>
