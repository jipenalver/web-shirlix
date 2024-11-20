<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import { betweenValidator, requiredValidator } from '@/utils/validators'
import { formActionDefault, formDataMetrics } from '@/utils/supabase.js'
import { getMoneyText } from '@/utils/helpers'
import { ref, watch } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps(['isDialogVisible', 'itemData'])

const emit = defineEmits(['update:isDialogVisible', 'quantity'])

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()

// Load Variables
const formDataDefault = {
  qty: 0,
  qty_metric: '',
  unit_price: 0,
  unit_price_metric: '',
  name: ''
}
const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})
const refVForm = ref()

// Monitor itemData if it has data
watch(
  () => props.itemData,
  () => {
    formData.value.qty_metric = props.itemData.qty_metric
    formData.value.unit_price = props.itemData.unit_price
    formData.value.unit_price_metric = props.itemData.unit_price_metric
    formData.value.name = props.itemData.products.name
  }
)

// Submit Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  // Form Reset and Close Dialog
  setTimeout(() => {
    emit('quantity', formData.value.qty)
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
  <v-dialog
    :max-width="mdAndDown ? undefined : '600'"
    :model-value="props.isDialogVisible"
    :fullscreen="mdAndDown"
    persistent
  >
    <v-card prepend-icon="mdi-weight" :title="formData.name" subtitle="Weight / Qty">
      <template #append>
        <b>
          {{
            formData.unit_price
              ? getMoneyText(formData.unit_price) + ' per ' + formData.unit_price_metric
              : 'n/a'
          }}
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
                :rules="[requiredValidator, betweenValidator(formData.qty, 0.001, 999999.999)]"
                hint="Please select correct metric"
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
