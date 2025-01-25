<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import { betweenValidator, requiredValidator } from '@/utils/validators'
import { formActionDefault } from '@/utils/supabase.js'
import { useAuthUserStore } from '@/stores/authUser'
import { useBranchesStore } from '@/stores/branches'
import { useExpensesStore } from '@/stores/expenses'
import { onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps(['isDialogVisible', 'itemData', 'tableOptions', 'tableFilters'])

const emit = defineEmits(['update:isDialogVisible'])

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()

// Use Pinia Store
const branchesStore = useBranchesStore()
const expensesStore = useExpensesStore()
const authStore = useAuthUserStore()

// Load Variables
const formDataDefault = {
  name: '',
  description: '',
  amount: undefined,
  spent_at: new Date(),
  branch_id: null,
  user_id: authStore.userData.id
}
const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})
const refVForm = ref()
const isUpdate = ref(false)

// Monitor itemData if it has data
watch(
  () => props.itemData,
  () => {
    isUpdate.value = props.itemData ? true : false
    formData.value = props.itemData
      ? { ...props.itemData, spent_at: new Date(props.itemData.spent_at) }
      : { ...formDataDefault }
  }
)

// Submit Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  // Check if isUpdate is true, then do update, if false do add
  const { data, error } = isUpdate.value
    ? await expensesStore.updateExpenditure(formData.value)
    : await expensesStore.addExpenditure(formData.value)

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    // Turn off processing
    formAction.value.formProcess = false
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = isUpdate.value
      ? 'Successfully Updated Expenditure Information.'
      : 'Successfully Added Expenditure.'

    await expensesStore.getExpensesTable(props.tableOptions, props.tableFilters)

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
  formData.value = { ...formDataDefault }
  emit('update:isDialogVisible', false)
}

// Load Functions during component rendering
onMounted(async () => {
  if (branchesStore.branches.length == 0) await branchesStore.getBranches()
})
</script>

<template>
  <v-dialog
    :max-width="mdAndDown ? undefined : '800'"
    :model-value="props.isDialogVisible"
    :fullscreen="mdAndDown"
    persistent
  >
    <v-card prepend-icon="mdi-cash-remove" title="Expenditure Information">
      <AlertNotification
        :form-success-message="formAction.formSuccessMessage"
        :form-error-message="formAction.formErrorMessage"
      ></AlertNotification>

      <v-form ref="refVForm" @submit.prevent="onFormSubmit">
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="Name"
                :rules="[requiredValidator]"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="formData.description" label="Description" rows="2"></v-textarea>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.amount"
                prefix="Php"
                label="Amount"
                type="number"
                min="0"
                :rules="[requiredValidator, betweenValidator(formData.amount, 0.001, 999999.999)]"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="formData.branch_id"
                label="Branch"
                :items="branchesStore.branches"
                item-title="name"
                item-value="id"
                clearable
                :rules="[requiredValidator]"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12">
              <v-date-input
                v-model="formData.spent_at"
                label="Date Spent"
                :rules="[requiredValidator]"
                hide-actions
              ></v-date-input>
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
            {{ isUpdate ? 'Update Expenditure' : 'Add Expenditure' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
