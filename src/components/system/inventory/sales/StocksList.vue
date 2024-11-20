<script setup>
import StockQtyFormDialog from './StockQtyFormDialog.vue'
import { useSalesStore } from '@/stores/sales'
import { getMoneyText } from '@/utils/helpers'
import { tableSearch } from '@/utils/supabase'
import { onMounted, ref } from 'vue'

const emit = defineEmits(['quantity'])

// Use Pinia Store
const salesStore = useSalesStore()

// Load Variables
const listFilters = ref({
  search: ''
})
const listData = ref([])
const itemData = ref(null)
const isFormDialogVisible = ref(false)

// Add Weight / Qty
const onAddQty = (item) => {
  itemData.value = item
  isFormDialogVisible.value = true
}

// Emit Qty
const onSoldQty = (qty) => {
  emit('quantity', { product: itemData.value, qty })
}

// Retrieve Data based on Search
const onSearchItems = async () => {
  if (
    listFilters.value.search?.length >= 4 ||
    listFilters.value.search?.length == 0 ||
    listFilters.value.search === null
  )
    onLoadItems(listFilters.value)
}

// Load List Data
const onLoadItems = async ({ search }) => {
  await salesStore.getStocks()

  listData.value = salesStore.stocks.filter((item) =>
    item.products.name.toLowerCase().includes(tableSearch(search).toLowerCase())
  )
}

// Load Functions during component rendering
onMounted(() => {
  if (listData.value.length == 0) onLoadItems(listFilters.value)
})
</script>

<template>
  <v-row dense>
    <v-col cols="12">
      <v-card>
        <v-card-text>
          <v-text-field
            v-model="listFilters.search"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search Name"
            clearable
            @click:clear="onSearchItems"
            @input="onSearchItems"
          ></v-text-field>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="4" md="3" v-for="(item, index) in listData" :key="index">
      <v-card @click="onAddQty(item)">
        <v-img
          height="150"
          :src="item.products ? item.products.image_url : '/images/img-product.png'"
          cover
        ></v-img>

        <v-card-title class="text-center text-body-2">
          <b>{{ item.products ? item.products.name : 'n/a' }}</b>
        </v-card-title>

        <v-card-subtitle class="text-center font-weight-bold mb-3">
          {{
            item.unit_price
              ? getMoneyText(item.unit_price) + ' per ' + item.unit_price_metric
              : 'n/a'
          }}
        </v-card-subtitle>
      </v-card>
    </v-col>
  </v-row>

  <StockQtyFormDialog
    v-model:is-dialog-visible="isFormDialogVisible"
    :item-data="itemData"
    @quantity="onSoldQty"
  ></StockQtyFormDialog>
</template>
