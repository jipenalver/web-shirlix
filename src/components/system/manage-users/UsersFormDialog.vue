<script setup>
import { emailValidator, passwordValidator, requiredValidator } from '@/utils/validators'
import AlertNotification from '@/components/common/AlertNotification.vue'
import { formActionDefault } from '@/utils/supabase.js'
import { useUserRolesStore } from '@/stores/userRoles'
import { useBranchesStore } from '@/stores/branches'
import { useUsersStore } from '@/stores/users'
import { onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps(['isDialogVisible', 'itemData', 'tableOptions'])

const emit = defineEmits(['update:isDialogVisible'])

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()

// Use Pinia Store
const branchesStore = useBranchesStore()
const userRolesStore = useUserRolesStore()
const usersStore = useUsersStore()

// Load Variables
const formDataDefault = {
  email: '',
  password: '',
  firstname: '',
  middlename: '',
  lastname: '',
  phone: '',
  branch: null,
  user_role: null
}
const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})
const refVForm = ref()
const isPasswordVisible = ref(false)
const isUpdate = ref(false)

// Monitor itemData if it has data
watch(
  () => props.isDialogVisible,
  () => {
    isUpdate.value = props.itemData ? true : false
    formData.value = props.itemData
      ? { ...props.itemData, branch: props.itemData.branch.split(',') }
      : { ...formDataDefault }
  }
)

// Submit Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  // Check if isUpdate is true, then do update, if false do add
  const { data, error } = isUpdate.value
    ? await usersStore.updateUser(formData.value)
    : await usersStore.addUser(formData.value)

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    // Turn off processing
    formAction.value.formProcess = false
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = isUpdate.value
      ? 'Successfully Updated User Information.'
      : 'Successfully Added User.'

    await usersStore.getUsersTable(props.tableOptions)

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
  if (userRolesStore.userRoles.length == 0) await userRolesStore.getUserRoles()
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
    <v-card prepend-icon="mdi-account" title="User Information">
      <AlertNotification
        :form-success-message="formAction.formSuccessMessage"
        :form-error-message="formAction.formErrorMessage"
      ></AlertNotification>

      <v-form ref="refVForm" @submit.prevent="onFormSubmit">
        <v-card-text>
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
              <v-autocomplete
                v-model="formData.user_role"
                label="User Role"
                :items="userRolesStore.userRoles"
                item-title="user_role"
                item-value="user_role"
                clearable
                :rules="[requiredValidator]"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="formData.branch"
                label="Branch"
                :items="branchesStore.branches"
                item-title="name"
                item-value="name"
                clearable
                :rules="[requiredValidator]"
                multiple
                chips
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.email"
                label="Email"
                prepend-inner-icon="mdi-email-outline"
                :readonly="isUpdate"
                :rules="[requiredValidator, emailValidator]"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.phone"
                label="Phone"
                prepend-inner-icon="mdi-phone"
                prefix="+63"
                :rules="[requiredValidator]"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="formData.password"
                label="Password"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                :rules="[requiredValidator, passwordValidator]"
              ></v-text-field>
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
            {{ isUpdate ? 'Update User' : 'Add User' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
