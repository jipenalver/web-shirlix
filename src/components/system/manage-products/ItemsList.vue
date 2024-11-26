<script setup>
import { onMounted } from 'vue'
import { useItemsStore } from '@/stores/items'

// Use Pinia Store
const itemsStore = useItemsStore()

// Trigger retrieve from api and reset db
const onRetrieveFromApi = async () => {
  await itemsStore.getItemsFromApi()
}

// Load Functions during component rendering
onMounted(async () => {
  if (itemsStore.items.length == 0) await itemsStore.getItems()
})
</script>

<template>
  <v-row>
    <v-col cols="12" sm="8">
      <v-text-field
        variant="outlined"
        label="Label"
        density="compact"
        append-inner-icon="mdi-magnify"
        clearable
      ></v-text-field>
    </v-col>

    <v-col cols="12" sm="3">
      <v-btn prepend-icon="mdi-plus" color="red-darken-2" block> Add Item </v-btn>
    </v-col>

    <v-col cols="12" sm="1">
      <v-btn variant="elevated" density="comfortable" @click="onRetrieveFromApi" icon>
        <v-icon icon="mdi-refresh"></v-icon>
      </v-btn>
    </v-col>

    <v-divider class="mb-3"></v-divider>

    <v-col cols="12" sm="4" v-for="item in itemsStore.items" :key="item.id">
      <v-card :title="item.name" height="200">
        <v-card-text>
          <ul class="ms-5">
            <li v-for="(value, key) in item.data" :key="key">
              <span class="font-weight-bold">{{ key }}:</span> {{ value }}
            </li>
          </ul>
        </v-card-text>

        <v-card-actions>
          <v-btn variant="elevated" density="comfortable" icon>
            <v-icon icon="mdi-pencil"></v-icon>
          </v-btn>

          <v-btn variant="elevated" density="comfortable" icon>
            <v-icon color="error" icon="mdi-trash-can"></v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped></style>
