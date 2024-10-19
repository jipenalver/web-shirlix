<script setup>
import { useUserRolesStore } from '@/stores/userRoles'
import AlertNotification from '@/components/common/AlertNotification.vue'
import { requiredValidator } from '@/utils/validators'
import { formActionDefault } from '@/utils/supabase.js'
import { ref, watch } from 'vue'

const props = defineProps(['isDialogVisible', 'itemData'])

const emit = defineEmits(['update:isDialogVisible'])

// Use Pinia Store
const userRolesStore = useUserRolesStore()

// Load Variables
const formDataDefault = {
  user_role: ''
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
    ? await userRolesStore.updateUserRole(formData.value)
    : await userRolesStore.addUserRole(formData.value)

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    // Turn off processing
    formAction.value.formProcess = false
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Added User Role.'

    // Retrieve User Roles
    await userRolesStore.getUserRoles()

    // Form Reset and Close Dialog
    setTimeout(() => {
      onFormReset()
    }, 3500)
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
</script>

<template>
  <v-dialog max-width="600" :model-value="props.isDialogVisible" persistent>
    <v-card prepend-icon="mdi-tag" title="User Role">
      <AlertNotification
        :form-success-message="formAction.formSuccessMessage"
        :form-error-message="formAction.formErrorMessage"
      ></AlertNotification>

      <v-form ref="refVForm" @submit.prevent="onFormSubmit">
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="formData.user_role"
                label="Role Name"
                :rules="[requiredValidator]"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>

          <v-btn text="Close" variant="plain" @click="onFormReset"></v-btn>

          <v-btn
            prepend-icon="mdi-pencil"
            color="deep-orange-lighten-1"
            type="submit"
            variant="elevated"
            :disabled="formAction.formProcess"
            :loading="formAction.formProcess"
          >
            {{ isUpdate ? 'Update Role' : 'Add Role' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
