<script setup>
import { useAuthUserStore } from '@/stores/authUser'
import { useBranchesStore } from '@/stores/branches'
import { useExpensesStore } from '@/stores/expenses'
import AlertNotification from '@/components/common/AlertNotification.vue'
import { requiredValidator } from '@/utils/validators'
import { formActionDefault } from '@/utils/supabase.js'
import { onMounted, ref, watch } from 'vue'

const props = defineProps(['isDialogVisible', 'itemData', 'tableOptions', 'tableFilters'])

const emit = defineEmits(['update:isDialogVisible'])

// Use Pinia Store
const branchesStore = useBranchesStore()
const expensesStore = useExpensesStore()
const authStore = useAuthUserStore()

// Load Variables
const formDataDefault = {
  name: '',
  description: '',
  amount: 0,
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
  (propsItemData) => {
    isUpdate.value = propsItemData ? true : false
    formData.value = propsItemData ? { ...propsItemData } : { ...formDataDefault }
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
    formAction.value.formSuccessMessage = 'Successfully Added Expenditure.'

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
  <v-dialog max-width="800" :model-value="props.isDialogVisible" persistent>
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
              <v-textarea
                v-model="formData.description"
                label="Description"
                :rules="[requiredValidator]"
              ></v-textarea>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.amount"
                prefix="Php"
                label="Amount"
                type="number"
                min="0"
                :rules="[requiredValidator]"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
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
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>

          <v-btn text="Close" variant="plain" prepend-icon="mdi-close" @click="onFormReset"></v-btn>

          <v-btn
            prepend-icon="mdi-pencil"
            color="deep-orange-lighten-1"
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
