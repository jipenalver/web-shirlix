<script setup>
import { integerValidator, requiredValidator } from '@/utils/validators'
import AlertNotification from '@/components/common/AlertNotification.vue'
import { formActionDefault } from '@/utils/supabase.js'
import { useAuthUserStore } from '@/stores/authUser'
import { ref } from 'vue'

// Use Pinia Store
const authStore = useAuthUserStore()

// Load Variables
const formDataDefault = {
  firstname: authStore.userData.firstname,
  middlename: authStore.userData.middlename,
  lastname: authStore.userData.lastname,
  email: authStore.userData.email,
  phone: authStore.userData.phone
}
const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})
const refVForm = ref()

// Submit Functionality
const onSubmit = async () => {
  /// Reset Form Action utils; Turn on processing at the same time
  formAction.value = { ...formActionDefault, formProcess: true }

  const { data, error } = await authStore.updateUserInformation(formData.value)

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Updated Account.'
  }

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
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="formData.firstname"
          label="Firstname"
          :rules="[requiredValidator]"
        ></v-text-field>
      </v-col>

      <v-col cols="12" sm="4">
        <v-text-field v-model="formData.middlename" label="Middlename"></v-text-field>
      </v-col>

      <v-col cols="12" sm="4">
        <v-text-field
          v-model="formData.lastname"
          label="Lastname"
          :rules="[requiredValidator]"
        ></v-text-field>
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          readonly
          disabled
          v-model="formData.email"
          label="Email"
          prepend-inner-icon="mdi-email-outline"
        ></v-text-field>
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          v-model="formData.phone"
          label="Phone Number"
          prepend-inner-icon="mdi-phone"
          prefix="+63"
          :rules="[requiredValidator, integerValidator]"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-btn
      class="mt-2"
      type="submit"
      color="red-darken-4"
      prepend-icon="mdi-account-box-edit-outline"
      :disabled="formAction.formProcess"
      :loading="formAction.formProcess"
    >
      Update Information
    </v-btn>
  </v-form>
</template>
