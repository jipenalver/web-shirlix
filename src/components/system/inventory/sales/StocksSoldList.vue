<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { getMoneyText, getPreciseNumber } from '@/utils/helpers'
import AddSalesFormDialog from './AddSalesFormDialog.vue'
import { formActionDefault } from '@/utils/supabase.js'
import AddCustomerBtn from './AddCustomerBtn.vue'
import AddDiscountBtn from './AddDiscountBtn.vue'
import { useSalesStore } from '@/stores/sales'
import { useDisplay } from 'vuetify'
import { ref, onMounted } from 'vue'

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()

// Use Pinia Store
const salesStore = useSalesStore()

// Load Variables
const formDataDefault = {
  customer: '',
  discount: 0,
  is_cash_discount: false
}
const formData = ref({ ...formDataDefault })
const formAction = ref({ ...formActionDefault })
const deleteIndex = ref(null)
const isConfirmDeleteDialog = ref(false)
const isConfirmSoldDialog = ref(false)
const windowSize = ref({ x: 0, y: 0 })
const soldData = ref(null)
const resetKey = ref(0)

// Calculate Total Overall
const getDiscountedTotal = () => {
  if (formData.value.is_cash_discount)
    return salesStore.stocksCartTotal - Number(formData.value.discount)
  else
    return (
      salesStore.stocksCartTotal -
      salesStore.stocksCartTotal * (Number(formData.value.discount) / 100)
    )
}

// Set Discounted Price
const onDiscountPrice = (item) => {
  if (item.is_cash_discount) item.discounted_price = item.total_price - Number(item.discount)
  else item.discounted_price = item.total_price - item.total_price * (Number(item.discount) / 100)
}

// Toggle Discount either Percentage or Cash
const onDiscountToggle = (item) => {
  item.is_cash_discount = !item.is_cash_discount
  onDiscountPrice(item)
}

// Trigger Delete Btn
const onDelete = (index) => {
  deleteIndex.value = index
  isConfirmDeleteDialog.value = true
}

// Confirm Delete
const onConfirmDelete = async () => {
  // Load Stocks based on Branch
  await salesStore.getStocks({ branch_id: salesStore.stocksCart[0].product.branch_id })
  // Remove Item from Cart
  salesStore.stocksCart = salesStore.stocksCart.filter((item, index) => index !== deleteIndex.value)
  localStorage.setItem('stocksCart', JSON.stringify(salesStore.stocksCart))
}

// Add Customer Name on Form
const onAddCustomer = (value) => {
  formData.value.customer = value
}

// Add Discount on Form
const onAddDiscount = (value) => {
  formData.value.discount = value.discount
  formData.value.is_cash_discount = value.is_cash_discount
}

// Proceed Sales
const onProceed = () => {
  isConfirmSoldDialog.value = true

  soldData.value = {
    ...formData.value,
    overall_price: formData.value.discount == 0 ? salesStore.stocksCartTotal : getDiscountedTotal(),
    exact_price: salesStore.stocksExactTotal,
    stocks: salesStore.stocksCart
  }
}

// Retrieve Window Size
const onResize = () => {
  windowSize.value = { x: window.innerWidth, y: window.innerHeight }
}

// Form Reset
const onResetForm = () => {
  formData.value = { ...formDataDefault }
  resetKey.value++
}

// Load Functions during component rendering
onMounted(() => {
  onResize()
})
</script>

<template>
  <section v-resize="onResize">
    <v-row dense>
      <v-col cols="12">
        <AddCustomerBtn :key="resetKey" @form-data="onAddCustomer"></AddCustomerBtn>
      </v-col>
    </v-row>

    <v-divider class="my-3"></v-divider>

    <AlertNotification
      :form-success-message="formAction.formSuccessMessage"
      :form-error-message="formAction.formErrorMessage"
    ></AlertNotification>

    <div class="overflow-auto" :style="`height: ${windowSize.y - 380}px`">
      <v-list lines="one" v-for="(item, index) in salesStore.stocksCart" :key="index">
        <v-list-group :value="item.product.products.name" color="grey-lighten-1" fluid>
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              :prepend-avatar="mdAndDown ? undefined : item.product.products.image_url"
              :title="item.product.products.name"
              :subtitle="`${item.qty} x ${getMoneyText(item.product.unit_price)} / ${item.product.unit_price_metric}`"
            >
              <template #append>
                <div class="me-1">
                  <span class="text-body-2 font-weight-bold">
                    {{ getMoneyText(getPreciseNumber(item.discounted_price)) }}
                  </span>
                  <div v-if="item.discount > 0">
                    <span class="text-caption text-decoration-line-through">
                      {{ getMoneyText(getPreciseNumber(item.total_price)) }}
                    </span>
                  </div>
                </div>

                <v-btn variant="text" density="compact" @click="onDelete(index)" icon>
                  <v-icon icon="mdi-delete"></v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </template>

          <v-list-item>
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="item.discount"
                  class="mt-2"
                  variant="outlined"
                  density="compact"
                  :label="item.is_cash_discount ? 'Cash Discount' : 'Discount'"
                  :prepend-inner-icon="item.is_cash_discount ? 'mdi-currency-php' : 'mdi-percent'"
                  :append-icon="item.is_cash_discount ? 'mdi-cash' : 'mdi-sale'"
                  type="number"
                  min="0"
                  @click:append="onDiscountToggle(item)"
                  @update:model-value="onDiscountPrice(item)"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-list-item>
        </v-list-group>
      </v-list>
    </div>

    <v-row class="position-absolute bottom-0 left-0 right-0 pa-1 mx-1 bg-background" dense>
      <v-col cols="12">
        <AddDiscountBtn :key="resetKey" @form-data="onAddDiscount"></AddDiscountBtn>
      </v-col>

      <v-divider class="my-3"></v-divider>

      <v-col cols="12" class="d-flex justify-space-between">
        <h3>Payable Amount</h3>

        <h3>
          {{
            formData.discount == 0
              ? getMoneyText(getPreciseNumber(salesStore.stocksCartTotal))
              : getMoneyText(getPreciseNumber(getDiscountedTotal()))
          }}
        </h3>
      </v-col>

      <v-divider class="my-3"></v-divider>

      <v-col cols="12">
        <v-btn
          variant="elevated"
          prepend-icon="mdi-location-enter"
          color="red-darken-4"
          @click="onProceed"
          :disabled="formAction.formProcess || salesStore.stocksCart.length == 0"
          :loading="formAction.formProcess"
          block
        >
          Proceed
        </v-btn>
      </v-col>

      <div class="abs-padding"></div>
    </v-row>
  </section>

  <ConfirmDialog
    v-model:is-dialog-visible="isConfirmDeleteDialog"
    title="Confirm Delete"
    text="Are you sure you want to remove from cart?"
    @confirm="onConfirmDelete"
  ></ConfirmDialog>

  <AddSalesFormDialog
    v-model:is-dialog-visible="isConfirmSoldDialog"
    :sold-data="soldData"
    @reset-cart="onResetForm"
  ></AddSalesFormDialog>
</template>

<style scoped>
.abs-padding {
  height: 11rem;
}
</style>
