<script setup>
import AddCustomerBtn from './AddCustomerBtn.vue'
import AddDiscountBtn from './AddDiscountBtn.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { getMoneyText, getPreciseNumber } from '@/utils/helpers'
import { useSalesStore } from '@/stores/sales'
import { useDisplay } from 'vuetify'
import { ref } from 'vue'

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
const formData = ref({
  ...formDataDefault
})
const deleteIndex = ref(null)
const isConfirmDeleteDialog = ref(false)

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
const onConfirmDelete = () => {
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

// Calculate Total Overall
const onCalcTotal = () => {
  if (formData.value.is_cash_discount)
    return salesStore.getStocksCartTotal - Number(formData.value.discount)
  else
    return (
      salesStore.getStocksCartTotal -
      salesStore.getStocksCartTotal * (Number(formData.value.discount) / 100)
    )
}
</script>

<template>
  <section>
    <v-row dense>
      <v-col cols="12">
        <AddCustomerBtn @form-data="onAddCustomer"></AddCustomerBtn>
      </v-col>
    </v-row>

    <v-divider class="my-3"></v-divider>

    <v-list lines="one" v-for="(item, index) in salesStore.stocksCart" :key="index">
      <v-list-group :value="item.product.products.name" color="grey-lighten-1" fluid>
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            :prepend-avatar="mdAndDown ? undefined : item.product.products.image_url"
            :title="item.product.products.name"
            :subtitle="`${item.qty} x ${getMoneyText(item.product.unit_price)} per ${item.product.unit_price_metric}`"
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
                type="number"
                min="0"
                :append-icon="item.is_cash_discount ? 'mdi-cash' : 'mdi-sale'"
                @click:append="onDiscountToggle(item)"
                @update:model-value="onDiscountPrice(item)"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list-group>
    </v-list>

    <v-row class="position-absolute bottom-0 left-0 right-0 pa-4" dense>
      <v-col cols="12">
        <AddDiscountBtn @form-data="onAddDiscount"></AddDiscountBtn>
      </v-col>

      <v-divider class="my-3"></v-divider>

      <v-col cols="12" class="d-flex justify-space-between">
        <h3>Payable Amount</h3>

        <h3>
          {{
            formData.discount == 0
              ? getMoneyText(getPreciseNumber(salesStore.getStocksCartTotal))
              : onCalcTotal()
          }}
        </h3>
      </v-col>

      <v-divider class="my-3"></v-divider>

      <v-col cols="12">
        <v-btn variant="elevated" prepend-icon="mdi-location-enter" color="red-darken-4" block>
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
</template>

<style scoped>
.abs-padding {
  height: 10rem;
}
</style>
