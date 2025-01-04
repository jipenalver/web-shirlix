<script setup>
import { requiredValidator, betweenValidator, isEmpty, isObject } from '@/utils/validators'
import AlertNotification from '@/components/common/AlertNotification.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { getMoneyText, getPreciseNumber } from '@/utils/helpers'
import { formActionDefault } from '@/utils/supabase.js'
import { useSalesStore } from '@/stores/sales'
import { ref, watch } from 'vue'

const props = defineProps(['isDialogVisible', 'soldData'])

const emit = defineEmits(['update:isDialogVisible', 'resetCart'])

// Use Pinia Store
const salesStore = useSalesStore()

// Load Variables
const formDataDefault = {
  cash: undefined
}
const formData = ref({ ...formDataDefault })
const formAction = ref({ ...formActionDefault })
const refVForm = ref()
const salesData = ref(null)
const customer = ref('')
const isConfirmDialog = ref(false)
const confirmText = ref('')

// Monitor itemData if it has data
watch(
  () => props.soldData,
  () => {
    salesData.value = props.soldData
    customer.value = isObject(salesData.value.customer)
      ? salesData.value.customer.customer
      : !isEmpty(salesData.value.customer)
        ? salesData.value.customer
        : '-'
  }
)

// Proceed Sales
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  if (formData.value.cash < salesData.value.overall_price)
    salesData.value = { ...salesData.value, payment: formData.value.cash }

  const { branch_id } = salesData.value.stocks[0].product

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
    await salesStore.getCustomers()
    await salesStore.getStocks({ branch_id: localStorage.getItem('stocksBranchId') ?? branch_id })

    // Emit to Reset Components
    emit('resetCart')

    // Form Reset and Close Dialog
    setTimeout(() => {
      onFormReset()
    }, 2500)
  }
}

// Trigger Validators
const onFormSubmit = async () => {
  const validationResult = await refVForm.value?.validate()

  if (!validationResult?.valid) return

  const { cash } = formData.value
  const { overall_price } = salesData.value

  if (cash >= overall_price) {
    confirmText.value = 'Do you want to proceed with this transaction?'
    isConfirmDialog.value = true
    return
  }

  if (cash < overall_price) {
    if (customer.value !== '-') {
      confirmText.value = `The amount ${getMoneyText(cash)} is less than the total amount of ${getMoneyText(overall_price)}.
        This will be recorded as a partial payment for customer ${customer.value}. Do you wish to proceed?`
      isConfirmDialog.value = true
    } else {
      formAction.value.formErrorMessage =
        'Please add a customer or select an existing customer to proceed if you want to record this as a partial payment.'
    }
  }
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
                {{ customer }}
              </h3>
            </v-col>

            <v-divider class="my-3"></v-divider>

            <v-col cols="12" class="d-flex justify-space-between">
              <h3>Total Amount w/o Discount</h3>

              <h3>
                {{ getMoneyText(getPreciseNumber(salesData.exact_price)) }}
              </h3>
            </v-col>

            <v-divider class="my-3"></v-divider>

            <v-col cols="12" class="d-flex justify-space-between">
              <h1>Payable Amount</h1>

              <h1>
                {{ getMoneyText(getPreciseNumber(salesData.overall_price)) }}
              </h1>
            </v-col>

            <v-divider class="my-3"></v-divider>

            <v-col cols="12">
              <v-text-field
                v-model="formData.cash"
                prepend-inner-icon="mdi-currency-php"
                label="Amount Tendered"
                type="number"
                variant="underlined"
                min="0"
                :rules="[requiredValidator, betweenValidator(formData.cash, 0.001, 999999.999)]"
                autofocus
                reverse
              ></v-text-field>
            </v-col>

            <v-divider class="my-3"></v-divider>

            <v-col cols="12" class="d-flex justify-space-between">
              <h2>Change</h2>

              <h2>
                {{
                  formData.cash - salesData.overall_price < 0
                    ? getMoneyText(0)
                    : getMoneyText(getPreciseNumber(formData.cash - salesData.overall_price))
                }}
              </h2>
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
            Confirm
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <ConfirmDialog
    v-model:is-dialog-visible="isConfirmDialog"
    title="Confirm Amount"
    :text="confirmText"
    @confirm="onSubmit"
  ></ConfirmDialog>
</template>
