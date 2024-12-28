<script setup>
import {
  getAccumulatedNumber,
  getMoneyText,
  getPadLeftText,
  getPreciseNumber
} from '@/utils/helpers'
import AlertNotification from '@/components/common/AlertNotification.vue'
import StockQtyFormDialog from './StockQtyFormDialog.vue'
import { formActionDefault } from '@/utils/supabase.js'
import { useBranchesStore } from '@/stores/branches'
import { useSalesStore } from '@/stores/sales'
import { onMounted, ref } from 'vue'
import { useDate } from 'vuetify'

// Utilize pre-defined vue functions
const date = useDate()

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
const itemData = ref(null)
const isStockQtyFormDialogVisible = ref(false)

// Calculate Stock Remaining
const getStockRemaining = (item) => {
  return getPreciseNumber(item.qty_reweighed - getAccumulatedNumber(item.sale_products, 'qty'))
}

// Add Weight / Qty
const onAddQty = (item) => {
  formAction.value = { ...formActionDefault }
  const lastBranchId = salesStore.stocksCart[salesStore.stocksCart.length - 1]?.product.branch_id

  if (lastBranchId && lastBranchId !== item.branch_id) {
    formAction.value.formErrorMessage = 'You can only add items from the same branch'
    return
  }

  itemData.value = { ...item, stock_remaining: getStockRemaining(item) }
  isStockQtyFormDialogVisible.value = true
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
  formAction.value = { ...formActionDefault, formProcess: true }

  await salesStore.getStocks({ search, branch_id })

  formAction.value.formProcess = false
}

// Load Functions during component rendering
onMounted(async () => {
  if (branchesStore.branches.length == 0) await branchesStore.getBranches()
  listFilters.value.branch_id = branchesStore.branches[0].id
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

            <v-col cols="12" md="6"
              ><v-autocomplete
                v-model="listFilters.branch_id"
                :items="branchesStore.branches"
                label="Branch"
                density="compact"
                item-title="name"
                item-value="id"
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

          <div class="mt-1">
            <span class="font-weight-bold">
              {{
                item.sale_products.length === 0
                  ? item.qty_reweighed + ' ' + item.qty_metric
                  : getStockRemaining(item) + ' ' + item.qty_metric
              }}

              <v-chip class="mx-n2 cursor-pointer" density="compact" variant="text">
                <v-icon icon="mdi-information" size="small"></v-icon>
              </v-chip>

              <v-tooltip activator="parent" location="top" open-on-click>
                <ul class="ms-2">
                  <li>
                    <span class="font-weight-bold">Stock ID:</span> {{ getPadLeftText(item.id) }}
                  </li>
                  <li>
                    <span class="font-weight-bold">Purchased Date:</span>
                    {{ date.format(item.purchased_at, 'fullDate') }}
                  </li>
                  <li>
                    <span class="font-weight-bold">Expiration Date:</span>
                    {{ item.expired_at ? date.format(item.expired_at, 'fullDate') : 'n/a' }}
                  </li>
                  <li><span class="font-weight-bold">Supplier:</span> {{ item.supplier }}</li>
                </ul>
              </v-tooltip>
            </span>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <StockQtyFormDialog
    v-model:is-dialog-visible="isStockQtyFormDialogVisible"
    :item-data="itemData"
    @quantity="onCartQty"
  ></StockQtyFormDialog>
</template>
