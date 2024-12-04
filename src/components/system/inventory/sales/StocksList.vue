<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import StockQtyFormDialog from './StockQtyFormDialog.vue'
import { formActionDefault } from '@/utils/supabase.js'
import { useBranchesStore } from '@/stores/branches'
import { useSalesStore } from '@/stores/sales'
import { getMoneyText } from '@/utils/helpers'
import { tableSearch } from '@/utils/supabase'
import { onMounted, ref } from 'vue'

// Use Pinia Store
const salesStore = useSalesStore()
const branchesStore = useBranchesStore()

// Load Variables
const listFilters = ref({
  search: '',
  branch_id: null
})
const formAction = ref({
  ...formActionDefault
})
const listStocks = ref([])
const isListLoading = ref(false)
const itemData = ref(null)
const isFormDialogVisible = ref(false)

// Add Weight / Qty
const onAddQty = (item) => {
  formAction.value = { ...formActionDefault }
  const lastBranchId = salesStore.stocksCart[salesStore.stocksCart.length - 1]?.product.branch_id

  if (lastBranchId && lastBranchId !== item.branch_id) {
    formAction.value.formErrorMessage = 'You can only add items from the same branch'
    return
  }

  itemData.value = item
  isFormDialogVisible.value = true
}

// Set Stock Cart Qty
const onCartQty = (qty) => {
  salesStore.stocksCart.push({
    product: itemData.value,
    qty: Number(qty),
    discount: 0,
    is_cash_discount: false,
    total_price: Number(qty) * itemData.value.unit_price,
    discounted_price: Number(qty) * itemData.value.unit_price
  })
  localStorage.setItem('stocksCart', JSON.stringify(salesStore.stocksCart))
}

// Retrieve Data based on Filter
const onFilterItems = () => {
  onLoadItems(listFilters.value)
}

// Retrieve Data based on Search
const onSearchItems = async () => {
  if (
    listFilters.value.search?.length >= 2 ||
    listFilters.value.search?.length == 0 ||
    listFilters.value.search === null
  )
    onLoadItems(listFilters.value)
}

// Load List Data
const onLoadItems = async ({ search, branch_id }) => {
  formAction.value = { ...formActionDefault }
  isListLoading.value = true
  await salesStore.getStocks({ branch_id })

  // Filter Stocks by Search
  const filteredStocks = salesStore.stocks.filter((item) =>
    item.products.name.toLowerCase().includes(tableSearch(search).toLowerCase())
  )

  // Remove Duplicates in Stocks
  const uniqueStocks = Array.from(
    new Map(
      filteredStocks.map((item) => [
        `${item.products.name.toLowerCase()}|${item.unit_price}|${item.branch_id}`,
        item
      ])
    ).values()
  )

  listStocks.value = uniqueStocks
  isListLoading.value = false
}

// Load Functions during component rendering
onMounted(async () => {
  if (branchesStore.branches.length == 0) await branchesStore.getBranches()
  listFilters.value.branch_id = branchesStore.branches[0].id
  if (listStocks.value.length == 0) onLoadItems(listFilters.value)
})
</script>

<template>
  <v-row dense>
    <v-col cols="12">
      <v-card>
        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="listFilters.search"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                placeholder="Search Name"
                clearable
                @click:clear="onSearchItems"
                @input="onSearchItems"
                hide-details
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6"
              ><v-autocomplete
                v-model="listFilters.branch_id"
                :items="branchesStore.branches"
                label="Branch"
                density="compact"
                item-title="name"
                item-value="id"
                clearable
                @update:model-value="onFilterItems"
                hide-details
              ></v-autocomplete
            ></v-col>
          </v-row>
        </v-card-text>

        <AlertNotification
          :form-success-message="formAction.formSuccessMessage"
          :form-error-message="formAction.formErrorMessage"
        ></AlertNotification>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3" v-for="(item, index) in listStocks" :key="index">
      <v-card @click="onAddQty(item)" :loading="isListLoading" :disabled="isListLoading">
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
    @quantity="onCartQty"
  ></StockQtyFormDialog>
</template>
