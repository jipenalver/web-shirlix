<script setup>
import { getAccumulatedNumber, getMoneyText, getPreciseNumber } from '@/utils/helpers'
import AlertNotification from '@/components/common/AlertNotification.vue'
import { requiredValidator, betweenValidator } from '@/utils/validators'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { formActionDefault } from '@/utils/supabase.js'
import { useDisplay } from 'vuetify'
import { useDate } from 'vuetify'
import { ref } from 'vue'

const props = defineProps(['isDialogVisible', 'soldData'])

const emit = defineEmits(['update:isDialogVisible'])

// Utilize pre-defined vue functions
const date = useDate()
const { mdAndDown } = useDisplay()

// Load Variables
const formDataDefault = {
  payment: ''
}
const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})
const refVForm = ref()
const isConfirmDialog = ref(false)
const confirmText = ref('')

// Calculate change
const getBalance = () => {
  return (
    props.soldData.overall_price - getAccumulatedNumber(props.soldData.customer_payments, 'payment')
  )
}

// Proceed Payment
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }
}

// Trigger Validators
const onFormSubmit = async () => {
  const validationResult = await refVForm.value?.validate()

  if (!validationResult?.valid) return

  const { payment } = formData.value

  if (payment >= getBalance()) {
    confirmText.value = 'Do you want to proceed with this transaction?'
    isConfirmDialog.value = true
    return
  }

  if (payment < getBalance()) {
    confirmText.value = `The amount ${getMoneyText(payment)} is less than the total amount of ${getMoneyText(getBalance())}.
        This will be recorded as a partial payment for customer ${props.soldData.customers.customer}. Do you wish to proceed?`
    isConfirmDialog.value = true
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
  <v-dialog
    :max-width="mdAndDown ? undefined : '800'"
    :model-value="props.isDialogVisible"
    :fullscreen="mdAndDown"
    persistent
  >
    <v-card
      prepend-icon="mdi-account-credit-card"
      title="Customer Payments"
      :subtitle="`Branch: ${props.soldData.branches.name}`"
    >
      <AlertNotification
        :form-success-message="formAction.formSuccessMessage"
        :form-error-message="formAction.formErrorMessage"
      ></AlertNotification>

      <v-form ref="refVForm" @submit.prevent="onFormSubmit">
        <v-card-text>
          <v-list>
            <v-list-item
              lines="two"
              v-for="(item, index) in props.soldData.customer_payments"
              :key="index"
              :title="date.format(item.created_at, 'fullDateTime')"
            >
              <template #append>
                <h3>
                  {{ getMoneyText(item.payment) }}
                </h3>
              </template>
            </v-list-item>

            <v-divider thickness="2"></v-divider>

            <v-list-item lines="two">
              <template #title>
                <h3>Partial Payment(s)</h3>
              </template>

              <template #append>
                <h3>
                  {{
                    getMoneyText(getAccumulatedNumber(props.soldData.customer_payments, 'payment'))
                  }}
                </h3>
              </template>
            </v-list-item>

            <v-list-item lines="two">
              <template #title>
                <h1>Balance</h1>
              </template>

              <template #append>
                <h1>
                  {{ getMoneyText(getPreciseNumber(getBalance())) }}
                </h1>
              </template>
            </v-list-item>

            <v-divider thickness="2"></v-divider>

            <v-list-item lines="two">
              <v-text-field
                v-model="formData.payment"
                prepend-inner-icon="mdi-currency-php"
                label="Pay Amount"
                type="number"
                variant="underlined"
                min="0"
                :rules="[requiredValidator, betweenValidator(formData.payment, 0.001, 999999.999)]"
                autofocus
                reverse
              ></v-text-field>
            </v-list-item>

            <v-list-item lines="two">
              <template #title>
                <h2>Change</h2>
              </template>

              <template #append>
                <h2>
                  {{
                    formData.payment - getBalance() < 0
                      ? getMoneyText(0)
                      : getMoneyText(getPreciseNumber(formData.payment - getBalance()))
                  }}
                </h2>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>

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
