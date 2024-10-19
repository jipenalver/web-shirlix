<script setup>
import { ref, watch } from 'vue'

const headers = ref([
  {
    title: 'Dessert (100g serving)',
    align: 'start',
    sortable: false,
    key: 'name'
  },
  { title: 'Calories', key: 'calories', align: 'end' },
  { title: 'Fat (g)', key: 'fat', align: 'end' },
  { title: 'Carbs (g)', key: 'carbs', align: 'end' },
  { title: 'Protein (g)', key: 'protein', align: 'end' },
  { title: 'Iron (%)', key: 'iron', align: 'end' }
])

const desserts = [
  {
    name: 'Frozen Yogurt',
    calories: 159,
    fat: 6,
    carbs: 24,
    protein: 4,
    iron: '1'
  },
  {
    name: 'Jelly bean',
    calories: 375,
    fat: 0,
    carbs: 94,
    protein: 0,
    iron: '0'
  },
  {
    name: 'KitKat',
    calories: 518,
    fat: 26,
    carbs: 65,
    protein: 7,
    iron: '6'
  },
  {
    name: 'Eclair',
    calories: 262,
    fat: 16,
    carbs: 23,
    protein: 6,
    iron: '7'
  },
  {
    name: 'Gingerbread',
    calories: 356,
    fat: 16,
    carbs: 49,
    protein: 3.9,
    iron: '16'
  },
  {
    name: 'Ice cream sandwich',
    calories: 237,
    fat: 9,
    carbs: 37,
    protein: 4.3,
    iron: '1'
  },
  {
    name: 'Lollipop',
    calories: 392,
    fat: 0.2,
    carbs: 98,
    protein: 0,
    iron: '2'
  },
  {
    name: 'Cupcake',
    calories: 305,
    fat: 3.7,
    carbs: 67,
    protein: 4.3,
    iron: '8'
  },
  {
    name: 'Honeycomb',
    calories: 408,
    fat: 3.2,
    carbs: 87,
    protein: 6.5,
    iron: '45'
  },
  {
    name: 'Donut',
    calories: 452,
    fat: 25,
    carbs: 51,
    protein: 4.9,
    iron: '22'
  }
]

const FakeAPI = {
  async fetch({ page, itemsPerPage, sortBy, search }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const start = (page - 1) * itemsPerPage
        const end = start + itemsPerPage
        const items = desserts.slice().filter((item) => {
          if (search.name && !item.name.toLowerCase().includes(search.name.toLowerCase())) {
            return false
          }
          if (search.calories && !(item.calories >= Number(search.calories))) {
            return false
          }
          return true
        })
        if (sortBy.length) {
          const sortKey = sortBy[0].key
          const sortOrder = sortBy[0].order
          items.sort((a, b) => {
            const aValue = a[sortKey]
            const bValue = b[sortKey]
            return sortOrder === 'desc' ? bValue - aValue : aValue - bValue
          })
        }
        const paginated = items.slice(start, end)
        resolve({ items: paginated, total: items.length })
      }, 500)
    })
  }
}

const itemsPerPage = ref(5)
const serverItems = ref([])
const loading = ref(true)
const totalItems = ref(0)
const name = ref('')
const calories = ref('')
const search = ref('')

function loadItems({ page, itemsPerPage, sortBy }) {
  loading.value = true
  FakeAPI.fetch({
    page,
    itemsPerPage,
    sortBy,
    search: { name: name.value, calories: calories.value }
  }).then(({ items, total }) => {
    serverItems.value = items
    totalItems.value = total
    loading.value = false
  })
}

watch(name, () => {
  search.value = String(Date.now())
})
watch(calories, () => {
  search.value = String(Date.now())
})
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="serverItems"
        :items-length="totalItems"
        :loading="loading"
        :search="search"
        item-value="name"
        @update:options="loadItems"
      >
        <template #top>
          <v-row dense>
            <v-spacer></v-spacer>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="name"
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
      </v-data-table-server>
    </v-col>
  </v-row>
</template>
