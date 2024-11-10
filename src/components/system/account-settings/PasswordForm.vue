<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import { formActionDefault, supabase } from '@/utils/supabase.js'
import { confirmedValidator, passwordValidator, requiredValidator } from '@/utils/validators'
import { ref } from 'vue'

// Load Variables
const formDataDefault = {
  password: '',
  password_confirmation: ''
}
const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})
const isPasswordVisible = ref(false)
const isPasswordConfirmVisible = ref(false)
const refVForm = ref()

// Submit Functionality
const onSubmit = async () => {
  /// Reset Form Action utils; Turn on processing at the same time
  formAction.value = { ...formActionDefault, formProcess: true }

  const { data, error } = await supabase.auth.updateUser({
    password: formData.value.password
  })

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Changed Password.'
  }

  // Reset Form
  refVForm.value?.reset()
  // Turn off processing
  formAction.value.formProcess = false
}

// Trigger Validators
const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}
</script>

<template>
  <AlertNotification
    :form-success-message="formAction.formSuccessMessage"
    :form-error-message="formAction.formErrorMessage"
  ></AlertNotification>

  <v-form ref="refVForm" @submit.prevent="onFormSubmit">
    <v-row dense>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="formData.password"
          prepend-inner-icon="mdi-lock-outline"
          label="New Password"
          :type="isPasswordVisible ? 'text' : 'password'"
          :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="isPasswordVisible = !isPasswordVisible"
          :rules="[requiredValidator, passwordValidator]"
        ></v-text-field>
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          v-model="formData.password_confirmation"
          label="Password Confirmation"
          :type="isPasswordConfirmVisible ? 'text' : 'password'"
          :append-inner-icon="isPasswordConfirmVisible ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="isPasswordConfirmVisible = !isPasswordConfirmVisible"
          :rules="[
            requiredValidator,
            confirmedValidator(formData.password_confirmation, formData.password)
          ]"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-btn
      class="mt-2"
      type="submit"
      color="red-darken-4"
      prepend-icon="mdi-key"
      :disabled="formAction.formProcess"
      :loading="formAction.formProcess"
    >
      Change Password
    </v-btn>
  </v-form>
</template>
