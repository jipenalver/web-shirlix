<script setup>
import {
  mainNav,
  menuItemsNav1,
  menuItemsNav2,
  menuItemsNav3,
  menuItemsNav4,
  menuItemsNav5
} from '@/components/layout/navigation/sideNavigation'
import AlertNotification from '@/components/common/AlertNotification.vue'
import { formActionDefault } from '@/utils/supabase.js'
import { useUserRolesStore } from '@/stores/userRoles'
import { requiredValidator } from '@/utils/validators'
import { useDisplay } from 'vuetify'
import { ref, watch } from 'vue'

const props = defineProps(['isDialogVisible', 'itemData'])

const emit = defineEmits(['update:isDialogVisible'])

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()

// Use Pinia Store
const userRolesStore = useUserRolesStore()

// Load Variables
const formDataDefault = {
  user_role: '',
  pages: []
}
const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})
const refVForm = ref()
const isUpdate = ref(false)
const openedPages = ref(mainNav.map((elem) => elem[0]))

// Monitor itemData if it has data
watch(
  () => props.isDialogVisible,
  () => {
    isUpdate.value = props.itemData ? true : false
    formData.value = props.itemData
      ? { ...props.itemData, pages: props.itemData.pages.map((p) => p.page) }
      : { ...formDataDefault }
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
    formAction.value.formSuccessMessage = isUpdate.value
      ? "Successfully Updated User Role's Pages"
      : 'Successfully Added User Role.'

    await userRolesStore.getUserRoles()

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
</script>

<template>
  <v-dialog
    :max-width="mdAndDown ? undefined : '600'"
    :model-value="props.isDialogVisible"
    :fullscreen="mdAndDown"
    persistent
  >
    <v-card
      prepend-icon="mdi-tag"
      title="User Role"
      subtitle="Note: The Dashboard and Account Settings Page are accessible by default."
    >
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
                :disabled="isUpdate"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-list v-model:opened="openedPages" density="compact" nav>
                <v-list-group v-for="([title, icon], i) in mainNav" :key="i" :value="title">
                  <template #activator="{ props }">
                    <v-list-item v-bind="props" :prepend-icon="icon" :title="title"></v-list-item>
                  </template>

                  <template v-if="title === mainNav[0][0]">
                    <v-list-item
                      v-for="([title, icon, subtitle, to], i) in menuItemsNav1"
                      :key="i"
                      :prepend-icon="icon"
                      :title="title"
                      :subtitle="subtitle ?? undefined"
                    >
                      <template #append>
                        <v-list-item-action end>
                          <v-checkbox-btn v-model="formData.pages" :value="to"></v-checkbox-btn>
                        </v-list-item-action>
                      </template>
                    </v-list-item>
                  </template>

                  <template v-if="title === mainNav[1][0]">
                    <v-list-item
                      v-for="([title, icon, subtitle, to], i) in menuItemsNav2"
                      :key="i"
                      :prepend-icon="icon"
                      :title="title"
                      :subtitle="subtitle ?? undefined"
                    >
                      <template #append>
                        <v-list-item-action end>
                          <v-checkbox-btn v-model="formData.pages" :value="to"></v-checkbox-btn>
                        </v-list-item-action>
                      </template>
                    </v-list-item>
                  </template>

                  <template v-if="title === mainNav[2][0]">
                    <v-list-item
                      v-for="([title, icon, subtitle, to], i) in menuItemsNav3"
                      :key="i"
                      :prepend-icon="icon"
                      :title="title"
                      :subtitle="subtitle ?? undefined"
                    >
                      <template #append>
                        <v-list-item-action end>
                          <v-checkbox-btn v-model="formData.pages" :value="to"></v-checkbox-btn>
                        </v-list-item-action>
                      </template>
                    </v-list-item>
                  </template>

                  <template v-if="title === mainNav[3][0]">
                    <v-list-item
                      v-for="([title, icon, subtitle, to], i) in menuItemsNav4"
                      :key="i"
                      :prepend-icon="icon"
                      :title="title"
                      :subtitle="subtitle ?? undefined"
                    >
                      <template #append>
                        <v-list-item-action end>
                          <v-checkbox-btn v-model="formData.pages" :value="to"></v-checkbox-btn>
                        </v-list-item-action>
                      </template>
                    </v-list-item>
                  </template>

                  <template v-if="title === mainNav[4][0]">
                    <v-list-item
                      v-for="([title, icon, subtitle, to], i) in menuItemsNav5"
                      :key="i"
                      :prepend-icon="icon"
                      :title="title"
                      :subtitle="subtitle ?? undefined"
                    >
                      <template #append>
                        <v-list-item-action end>
                          <v-checkbox-btn v-model="formData.pages" :value="to"></v-checkbox-btn>
                        </v-list-item-action>
                      </template>
                    </v-list-item>
                  </template>
                </v-list-group>
              </v-list>
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
            {{ isUpdate ? 'Update Role' : 'Add Role' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
