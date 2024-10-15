<script setup>
import { requiredValidator } from '@/utils/validators'
import { formActionDefault } from '@/utils/supabase.js'
import { ref } from 'vue'

const props = defineProps(['isDialogVisible'])

const emit = defineEmits(['update:isDialogVisible'])

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

// Submit Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  //   const { data, error } = await supabase.auth.signUp({
  //     email: formData.value.email,
  //     password: formData.value.password,
  //     options: {
  //       data: {
  //         firstname: formData.value.firstname,
  //         lastname: formData.value.lastname,
  //         is_admin: false // Just turn to true if admin account
  //         // role: 'Administrator' // If role based; just change the string based on role
  //       }
  //     }
  //   })

  //   if (error) {
  //     // Add Error Message and Status Code
  //     formAction.value.formErrorMessage = error.message
  //     formAction.value.formStatus = error.status
  //   } else if (data) {
  //     // Add Success Message
  //     formAction.value.formSuccessMessage = 'Successfully Registered Account.'
  //   }

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
  <v-dialog max-width="600" :model-value="props.isDialogVisible" persistent>
    <v-card prepend-icon="mdi-tag" title="User Role">
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

          <v-btn
            text="Close"
            variant="plain"
            @click="emit('update:isDialogVisible', false)"
          ></v-btn>

          <v-btn
            prepend-icon="mdi-tag-plus"
            color="deep-orange-lighten-1"
            type="submit"
            variant="elevated"
            :disabled="formAction.formProcess"
            :loading="formAction.formProcess"
          >
            Add Role
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
