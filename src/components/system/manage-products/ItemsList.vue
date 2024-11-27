<script setup>
import ItemsFormDialog from './ItemsFormDialog.vue'
import { useItemsStore } from '@/stores/items'
import { getMoneyText } from '@/utils/helpers'
import { onMounted, ref } from 'vue'

// Use Pinia Store
const itemsStore = useItemsStore()

// Load Variables
const tableFilters = ref({
  search: ''
})
const itemData = ref(null)
const isDialogVisible = ref(false)

// Add Item
const onAdd = () => {
  itemData.value = null
  isDialogVisible.value = true
}

// Update Item
const onUpdate = (item) => {
  itemData.value = item
  isDialogVisible.value = true
}

// Delete Item; You can modify this, check other Components like ProductsTable, so that you could have confirm dialog
const onDelete = async (id) => {
  await itemsStore.deleteItem(id)
  await itemsStore.getItems(tableFilters.value)
}

// Retrieve Data based on Search
const onSearchItems = async () => {
  if (
    tableFilters.value.search?.length >= 3 ||
    tableFilters.value.search?.length == 0 ||
    tableFilters.value.search === null
  )
    await itemsStore.getItems(tableFilters.value)
}

// Trigger retrieve from api and reset db
const onRetrieveFromApi = async () => {
  await itemsStore.getItemsFromApi()
}

// Load Functions during component rendering
onMounted(async () => {
  if (itemsStore.items.length == 0) await itemsStore.getItems(tableFilters.value)
})
</script>

<template>
  <v-row>
    <v-col cols="12" sm="8">
      <v-text-field
        v-model="tableFilters.search"
        variant="outlined"
        label="Search Item"
        density="compact"
        append-inner-icon="mdi-magnify"
        clearable
        @click:clear="onSearchItems"
        @input="onSearchItems"
      ></v-text-field>
    </v-col>

    <v-col cols="12" sm="3">
      <v-btn prepend-icon="mdi-plus" color="red-darken-2" @click="onAdd" block> Add Item </v-btn>
    </v-col>

    <v-col cols="12" sm="1">
      <v-btn variant="elevated" density="comfortable" @click="onRetrieveFromApi" icon>
        <v-icon icon="mdi-refresh"></v-icon>
      </v-btn>
    </v-col>

    <v-divider class="mb-3"></v-divider>

    <v-col cols="12" sm="4" v-for="item in itemsStore.items" :key="item.id">
      <v-card :title="item.name" height="250">
        <v-img v-if="item.image_url" :src="item.image_url" height="50" cover></v-img>

        <v-card-text>
          <p class="mb-2">{{ item.description }}</p>

          <h2>{{ getMoneyText(item.price) }}</h2>
        </v-card-text>

        <v-card-actions>
          <v-btn variant="elevated" density="comfortable" @click="onUpdate(item)" icon>
            <v-icon icon="mdi-pencil"></v-icon>
          </v-btn>

          <v-btn variant="elevated" density="comfortable" @click="onDelete(item.id)" icon>
            <v-icon color="error" icon="mdi-trash-can"></v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>

  <ItemsFormDialog
    v-model:is-dialog-visible="isDialogVisible"
    :item-data="itemData"
    :table-filters="tableFilters"
  ></ItemsFormDialog>
</template>

<style scoped></style>
