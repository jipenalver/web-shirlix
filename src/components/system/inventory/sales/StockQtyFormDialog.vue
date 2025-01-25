<script setup>
import { getAccumulatedNumber, getMoneyText, getPreciseNumber } from '@/utils/helpers'
import AlertNotification from '@/components/common/AlertNotification.vue'
import { betweenValidator, requiredValidator } from '@/utils/validators'
import { formActionDefault, formDataMetrics } from '@/utils/supabase.js'
import { useSalesStore } from '@/stores/sales'
import { ref, watch } from 'vue'

const props = defineProps(['isDialogVisible', 'itemData', 'listFilters'])

const emit = defineEmits(['update:isDialogVisible', 'quantity'])

// Use Pinia Store
const salesStore = useSalesStore()

// Load Variables
const formDataDefault = {
  qty: undefined,
  qty_metric: ''
}
const formData = ref({ ...formDataDefault })
const formAction = ref({ ...formActionDefault })
const refVForm = ref()
const remainingQty = ref(0)

// Monitor itemData if it has data
watch(
  () => props.isDialogVisible,
  () => {
    const { qty_metric } = props.itemData
    formData.value = {
      ...formDataDefault,
      qty_metric
    }
    remainingQty.value = getStockRemaining(props.itemData)
  }
)

const getStockRemaining = (itemData) => {
  // Helper function to check if product matches criteria
  const isMatchingProduct = (item) =>
    item.product_id === itemData.product_id &&
    item.unit_price === itemData.unit_price &&
    item.unit_price_metric === itemData.unit_price_metric &&
    getAvailableQty(item) > 0
  // Helper function to calculate available quantity
  const getAvailableQty = (item) =>
    getPreciseNumber(item.qty_reweighed - getAccumulatedNumber(item.sale_products, 'qty'))

  // Get matching products and their available quantities
  const matchingProducts = salesStore.stocksBase.filter(isMatchingProduct)
  return matchingProducts.reduce((total, item) => total + getAvailableQty(item), 0)
}

// Submit Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }
  // Set Quantity on Cart
  emit('quantity', formData.value.qty)
  await salesStore.getStocks(props.listFilters)
  // Form Reset and Close Dialog
  setTimeout(() => {
    onFormReset()
  }, 750)
}

// Trigger Validators
const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}

// Form Reset
const onFormReset = () => {
  formAction.value = { ...formActionDefault }
  formData.value = { ...formDataDefault }
  emit('update:isDialogVisible', false)
}
</script>

<template>
  <v-dialog max-width="500" :model-value="props.isDialogVisible" persistent>
    <v-card
      prepend-icon="mdi-weight"
      :title="props.itemData.products.name"
      :subtitle="`Remaining Weight / Qty: ${remainingQty} ${props.itemData.qty_metric}`"
    >
      <template #append>
        <b>
          {{ getMoneyText(props.itemData.unit_price) + ' / ' + props.itemData.unit_price_metric }}
        </b>
      </template>

      <AlertNotification
        :form-success-message="formAction.formSuccessMessage"
        :form-error-message="formAction.formErrorMessage"
      ></AlertNotification>

      <v-form ref="refVForm" @submit.prevent="onFormSubmit">
        <v-card-text>
          <v-row dense>
            <v-col cols="9" sm="8">
              <v-text-field
                v-model="formData.qty"
                label="Weight / Qty"
                type="number"
                min="1"
                :rules="[requiredValidator, betweenValidator(formData.qty, 0.001, remainingQty)]"
              ></v-text-field>
            </v-col>

            <v-col cols="3" sm="4">
              <v-select
                v-model="formData.qty_metric"
                label="Metric"
                :items="formDataMetrics"
                readonly
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>

          <v-btn
            text="Close"
            variant="plain"
            prepend-icon="mdi-close"
            :disabled="formAction.formProcess"
            @click="onFormReset"
          ></v-btn>

          <v-btn
            prepend-icon="mdi-pencil"
            color="red-darken-4"
            type="submit"
            variant="elevated"
            :disabled="formAction.formProcess"
            :loading="formAction.formProcess"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
