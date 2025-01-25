<script setup>
import {
  categoryColors,
  categoryTextFormatter,
  defaultOptions,
  defaultSeries
} from './productsWidgetUtils'
import { getAccumulatedNumber, getPreciseNumber } from '@/utils/helpers'
import NotAcceptableUI from '@/components/errors/NotAcceptableUI.vue'
import { useBranchesStore } from '@/stores/branches'
import { useProductsStore } from '@/stores/products'
import { formActionDefault } from '@/utils/supabase'
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
const isDataLoading = ref(true)
const formAction = ref({ ...formActionDefault })
const barOptions = ref({ ...defaultOptions })
const series = ref([...defaultSeries])

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
    colors.push(categoryColors[i % categoryColors.length])

  return colors
}

// Retrieve Data based on Filter
const updateGraph = async () => {
  formAction.value = { ...formActionDefault, formProcess: true }
  await productsStore.getProductsByBranch(chartFilters.value.branch_id)

  series.value[0].data = productsStore.productsGraph.map((item) => {
    return getStockRemaining(item) > 0 ? getStockRemaining(item) : 0
  })

  barOptions.value.colors = getColors()
  barOptions.value.xaxis.categories = productsStore.productsGraph.map((item) =>
    categoryTextFormatter(item.name)
  )

  formAction.value.formProcess = false
}

// Load Functions during component rendering
onMounted(async () => {
  if (branchesStore.branches.length == 0) await branchesStore.getBranches()
  chartFilters.value.branch_id =
    Number(localStorage.getItem('stocksBranchId')) || branchesStore.branches > 0
      ? branchesStore.branches[0].id
      : null

  if (chartFilters.value.branch_id) await updateGraph()
  setTimeout(() => (isDataLoading.value = false), 2000)
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
    :loading="formAction.formProcess"
    :disabled="formAction.formProcess"
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
        :loading="isDataLoading"
        :disabled="isDataLoading"
        @update:model-value="updateGraph"
      ></v-autocomplete>
    </template>

    <v-card-text>
      <apexchart
        v-if="!isDataLoading"
        type="bar"
        width="100%"
        :options="barOptions"
        :series="series"
      ></apexchart>
    </v-card-text>
  </v-card>
</template>
