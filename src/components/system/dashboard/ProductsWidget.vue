<script setup>
import { getAccumulatedNumber, getPreciseNumber } from '@/utils/helpers'
import NotAcceptableUI from '@/components/errors/NotAcceptableUI.vue'
import { baseColors, otherOptions } from './productsWidgetUtils'
import { useBranchesStore } from '@/stores/branches'
import { useProductsStore } from '@/stores/products'
import { ref, onMounted } from 'vue'
import { useDisplay } from 'vuetify'

// Use Pinia Store
const productsStore = useProductsStore()
const branchesStore = useBranchesStore()

// Utilize pre-defined vue functions
const { xs } = useDisplay()

// Load Variables
const chartFilters = ref({
  branch_id: null
})
const isGraphLoading = ref(false)
const series = ref([
  {
    name: 'Quantity',
    data: []
  }
])

// Calculate Stock Remaining
const getStockRemaining = (item) => {
  return getPreciseNumber(
    getAccumulatedNumber(item.stock_ins, 'qty_reweighed') -
      getAccumulatedNumber(item.sale_products, 'qty')
  )
}

// Generate Colors
const getColors = () => {
  const colors = []

  for (let i = 0; i < productsStore.productsGraph.length; i++)
    colors.push(baseColors[i % baseColors.length])

  return colors
}

// Bar Chart Options
const barOptions = {
  ...otherOptions,
  colors: getColors(),
  xaxis: {
    type: 'category',
    categories: productsStore.productsGraph.map((item) => item.name),
    labels: {
      style: {
        colors: '#C62828',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    },
    title: {
      text: 'Products',
      style: {
        color: '#C62828'
      }
    }
  },

  tooltip: {
    theme: ''
  }
}

// Retrieve Data based on Filter
const updateGraph = async () => {
  isGraphLoading.value = true
  await productsStore.getProductsByBranch(chartFilters.value.branch_id)

  series.value[0].data = productsStore.productsGraph.map((item) => {
    return getStockRemaining(item) > 0 ? getStockRemaining(item) : 0
  })
  isGraphLoading.value = false
}

// Load Functions during component rendering
onMounted(async () => {
  if (branchesStore.branches.length == 0) await branchesStore.getBranches()
  chartFilters.value.branch_id = branchesStore.branches[0].id

  await updateGraph()
})
</script>

<template>
  <v-card v-if="xs" title="Product Inventory Level" subtitle="Quantity per product">
    <v-card-text class="mb-8">
      <NotAcceptableUI :is-show-back-btn="false"></NotAcceptableUI>
    </v-card-text>
  </v-card>

  <v-card
    v-else
    title="Product Inventory Level"
    subtitle="Quantity per product"
    :loading="isGraphLoading"
    :disabled="isGraphLoading"
  >
    <template #append>
      <v-autocomplete
        width="250px"
        v-model="chartFilters.branch_id"
        :items="branchesStore.branches"
        prepend-icon="mdi-store"
        density="compact"
        label="Branch"
        item-title="name"
        item-value="id"
        variant="outlined"
        hide-details
        @update:model-value="updateGraph"
      ></v-autocomplete>
    </template>

    <v-card-text>
      <apexchart type="bar" width="100%" :options="barOptions" :series="series"></apexchart>
    </v-card-text>
  </v-card>
</template>
