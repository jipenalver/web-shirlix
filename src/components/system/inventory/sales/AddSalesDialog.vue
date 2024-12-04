<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import { getMoneyText, getPreciseNumber } from '@/utils/helpers'
import { requiredValidator, betweenValidator } from '@/utils/validators'
import { formActionDefault } from '@/utils/supabase.js'
import { useSalesStore } from '@/stores/sales'
import { ref, watch } from 'vue'

const props = defineProps(['isDialogVisible', 'soldData'])

const emit = defineEmits(['update:isDialogVisible'])

// Use Pinia Store
const salesStore = useSalesStore()

// Load Variables
const formDataDefault = {
  cash: 0
}
const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})
const refVForm = ref()
const salesData = ref(null)

// Monitor itemData if it has data
watch(
  () => props.soldData,
  () => {
    salesData.value = props.soldData
  }
)

// Proceed Sales
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  const { data, error } = await salesStore.addSales(salesData.value)

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    // Turn off processing
    formAction.value.formProcess = false
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Sold Products.'

    // Reset Cart State
    salesStore.$resetCart()
    salesStore.getCustomers()

    // Form Reset and Close Dialog
    setTimeout(() => {
      onFormReset()
    }, 2500)
  }
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
  emit('update:isDialogVisible', false)
}
</script>

<template>
  <v-dialog max-width="500" :model-value="props.isDialogVisible" persistent>
    <v-card prepend-icon="mdi-printer-pos" title="Amount Information">
      <AlertNotification
        :form-success-message="formAction.formSuccessMessage"
        :form-error-message="formAction.formErrorMessage"
      ></AlertNotification>

      <v-form ref="refVForm" @submit.prevent="onFormSubmit">
        <v-card-text>
          <v-row dense>
            <v-col cols="12" class="d-flex justify-space-between">
              <h3>Customer</h3>

              <h3>
                {{ salesData.customer || '-' }}
              </h3>
            </v-col>

            <v-divider class="my-3"></v-divider>

            <v-col cols="12" class="d-flex justify-space-between">
              <h3>Discount</h3>

              <h3>
                {{
                  salesData.is_cash_discount
                    ? getMoneyText(salesData.discount)
                    : salesData.discount + '%'
                }}
              </h3>
            </v-col>

            <v-divider class="my-3"></v-divider>

            <v-col cols="12" class="d-flex justify-space-between">
              <h3>Payable Amount</h3>

              <h3>
                {{ getMoneyText(getPreciseNumber(salesData.overall_price)) }}
              </h3>
            </v-col>

            <v-divider class="my-3"></v-divider>

            <v-col cols="12">
              <v-text-field
                v-model="formData.cash"
                prepend-inner-icon="mdi-currency-php"
                label="Name"
                type="number"
                min="0"
                :rules="[requiredValidator, betweenValidator(formData.cash, 0.001, 999999.999)]"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>

          <v-btn text="Close" variant="plain" prepend-icon="mdi-close" @click="onFormReset"></v-btn>

          <v-btn
            prepend-icon="mdi-pencil"
            color="red-darken-4"
            type="submit"
            variant="elevated"
            :disabled="formAction.formProcess"
            :loading="formAction.formProcess"
          >
            Confirm Sale
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
