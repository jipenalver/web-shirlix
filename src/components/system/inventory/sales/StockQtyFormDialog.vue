<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import { betweenValidator, requiredValidator } from '@/utils/validators'
import { formActionDefault, formDataMetrics } from '@/utils/supabase.js'
import { useSalesStore } from '@/stores/sales'
import { getMoneyText } from '@/utils/helpers'
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

// Monitor itemData if it has data
watch(
  () => props.itemData,
  () => {
    const { qty_metric } = props.itemData
    formData.value = {
      ...formDataDefault,
      qty_metric
    }
  }
)

// Submit Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

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
      :subtitle="`Weight / Qty: ${props.itemData.stock_remaining} ${props.itemData.qty_metric}`"
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
                :rules="[
                  requiredValidator,
                  betweenValidator(formData.qty, 0.001, props.itemData.stock_remaining)
                ]"
                hint="If the purchase exceeds the remaining weight/quantity, proceed with the remaining weight/quantity, and reselect this product and add the additional weight/quantity needed."
                persistent-hint
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
