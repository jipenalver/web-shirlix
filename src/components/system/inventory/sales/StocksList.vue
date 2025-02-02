<script setup>
import { getAccumulatedNumber, getMoneyText, getPreciseNumber } from '@/utils/helpers'
import AlertNotification from '@/components/common/AlertNotification.vue'
import StockQtyFormDialog from './StockQtyFormDialog.vue'
import { formActionDefault } from '@/utils/supabase.js'
import { useBranchesStore } from '@/stores/branches'
import { useSalesStore } from '@/stores/sales'
import { onMounted, ref } from 'vue'

// Use Pinia Store
const salesStore = useSalesStore()
const branchesStore = useBranchesStore()

// Load Variables
const listFilters = ref({
  search: '',
  branch_id: null
})
const formAction = ref({ ...formActionDefault })
const itemData = ref(null)
const isStockQtyFormDialogVisible = ref(false)

// Add Weight / Qty
const onAddQty = (item) => {
  formAction.value = { ...formActionDefault }
  const lastBranchId = salesStore.stocksCart[salesStore.stocksCart.length - 1]?.product.branch_id

  if (lastBranchId && lastBranchId !== item.branch_id) {
    formAction.value.formErrorMessage = 'You can only add items from the same branch'
    return
  }

  itemData.value = item
  isStockQtyFormDialogVisible.value = true
}

// Set Stock Cart Qty
const onCartQty = (qty) => {
  // Early validation for existing item
  const isItemExist = salesStore.stocksCart.some(
    (item) => item.product.product_id === itemData.value.product_id
  )
  if (isItemExist) {
    formAction.value.formErrorMessage = 'Item already exists in the cart'
    return
  }

  // Helper function to check if product matches criteria
  const isMatchingProduct = (item) =>
    item.product_id === itemData.value.product_id &&
    item.unit_price === itemData.value.unit_price &&
    item.unit_price_metric === itemData.value.unit_price_metric &&
    getAvailableQty(item) > 0
  // Helper function to calculate available quantity
  const getAvailableQty = (item) =>
    getPreciseNumber(item.qty_reweighed - getAccumulatedNumber(item.sale_products, 'qty'))

  // Get matching products and their available quantities
  const matchingProducts = salesStore.stocksBase.filter(isMatchingProduct)

  // Helper function to create cart item
  const createCartItem = (quantity, product) => ({
    qty: quantity,
    discount: 0,
    is_cash_discount: false,
    total_price: quantity * itemData.value.unit_price,
    discounted_price: quantity * itemData.value.unit_price,
    product
  })
  // Distribute quantity across matching products
  let remainingQty = qty
  matchingProducts.forEach((product) => {
    if (remainingQty <= 0) return

    const availableQty = getAvailableQty(product)
    const qtyToAdd = Math.min(remainingQty, availableQty)

    if (qtyToAdd > 0) {
      salesStore.stocksCart.push(createCartItem(qtyToAdd, product))
      remainingQty -= qtyToAdd
    }
  })

  // Save to localStorage if any changes were made
  if (remainingQty < qty) localStorage.setItem('stocksCart', JSON.stringify(salesStore.stocksCart))
}

// Retrieve Data based on Filter
const onFilterItems = () => {
  localStorage.setItem('stocksBranchId', listFilters.value.branch_id)
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
  formAction.value = { ...formActionDefault, formProcess: true }

  await salesStore.getStocks({ search, branch_id })

  formAction.value.formProcess = false
}

// Load Functions during component rendering
onMounted(async () => {
  if (branchesStore.branches.length == 0) await branchesStore.getBranches()

  const storedBranchId = Number(localStorage.getItem('stocksBranchId'))
  listFilters.value.branch_id =
    storedBranchId || (branchesStore.branches.length > 0 ? branchesStore.branches[0].id : null)

  await onLoadItems(listFilters.value)
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

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="listFilters.branch_id"
                :items="branchesStore.branches"
                label="Branch"
                density="compact"
                item-title="name"
                item-value="id"
                @update:model-value="onFilterItems"
                hide-details
              ></v-autocomplete>
            </v-col>
          </v-row>
        </v-card-text>

        <AlertNotification
          :form-success-message="formAction.formSuccessMessage"
          :form-error-message="formAction.formErrorMessage"
        ></AlertNotification>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3" v-for="(item, index) in salesStore.stocks" :key="index">
      <v-card
        @click="onAddQty(item)"
        :loading="formAction.formProcess"
        :disabled="formAction.formProcess"
      >
        <v-img
          height="150"
          :src="item.products ? item.products.image_url : '/images/img-product.png'"
          cover
        ></v-img>

        <v-card-title class="text-center text-body-2">
          <b>{{ item.products ? item.products.name : 'n/a' }}</b>
        </v-card-title>

        <v-card-text class="text-center">
          <div class="font-weight-black">
            {{ getMoneyText(item.unit_price) + ' / ' + item.unit_price_metric }}
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <StockQtyFormDialog
    v-model:is-dialog-visible="isStockQtyFormDialogVisible"
    :item-data="itemData"
    :list-filters="listFilters"
    @quantity="onCartQty"
  ></StockQtyFormDialog>
</template>
