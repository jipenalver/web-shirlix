<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import { formActionDefault, supabase } from '@/utils/supabase'
import { requiredValidator, emailValidator } from '@/utils/validators'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Utilize pre-defined vue functions
const router = useRouter()

// Load Variables
const formDataDefault = {
  email: '',
  password: ''
}
const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})
const isPasswordVisible = ref(false)
const refVForm = ref()

const onSubmit = async () => {
  // Reset Form Action utils; Turn on processing at the same time
  formAction.value = { ...formActionDefault, formProcess: true }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.value.email,
    password: formData.value.password
  })

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Logged Account.'
    // Redirect Acct to Dashboard
    router.replace('/dashboard')
  }

  // Reset Form
  refVForm.value?.reset()
  // Turn off processing
  formAction.value.formProcess = false
}

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
      <v-col cols="12">
        <v-text-field
          v-model="formData.email"
          label="Email"
          prepend-inner-icon="mdi-email-outline"
          :rules="[requiredValidator, emailValidator]"
        ></v-text-field>
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="formData.password"
          prepend-inner-icon="mdi-lock-outline"
          label="Password"
          :type="isPasswordVisible ? 'text' : 'password'"
          :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="isPasswordVisible = !isPasswordVisible"
          :rules="[requiredValidator]"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-btn
      class="mt-2"
      type="submit"
      color="red-darken-4"
      prepend-icon="mdi-login"
      :disabled="formAction.formProcess"
      :loading="formAction.formProcess"
      block
    >
      Login
    </v-btn>
  </v-form>
</template>
