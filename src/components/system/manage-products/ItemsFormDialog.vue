<script setup>
import { useAuthUserStore } from '@/stores/authUser'
import AlertNotification from '@/components/common/AlertNotification.vue'
import { requiredValidator, imageValidator } from '@/utils/validators'
import { formActionDefault } from '@/utils/supabase.js'
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useItemsStore } from '@/stores/items'

const props = defineProps(['isDialogVisible', 'itemData', 'tableFilters'])

const emit = defineEmits(['update:isDialogVisible'])

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()

// Use Pinia Store
const itemsStore = useItemsStore()
const authStore = useAuthUserStore()

// Load Variables
const formDataDefault = {
  name: '',
  price: 0,
  description: '',
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
const imgPreview = ref('/images/img-product.png')

const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  // Check if isUpdate is true, then do update, if false do add
  const { data, error } = await itemsStore.addItem(formData.value)

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    // Turn off processing
    formAction.value.formProcess = false
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = isUpdate.value
      ? 'Successfully Updated Item Information.'
      : 'Successfully Added Item.'

    await itemsStore.getItems(props.tableFilters)

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
  emit('update:isDialogVisible', false)
}
</script>

<template>
  <v-dialog
    :max-width="mdAndDown ? undefined : '800'"
    :model-value="props.isDialogVisible"
    :fullscreen="mdAndDown"
    persistent
  >
    <v-card prepend-icon="mdi-information-box" title="Item Information">
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
              <v-text-field
                v-model="formData.price"
                prefix="Php"
                label="Name"
                min="0"
                type="number"
                :rules="[requiredValidator]"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                label="Description"
                rows="2"
                :rules="[requiredValidator]"
              ></v-textarea>
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-img
                width="55%"
                class="mx-auto rounded-circle"
                color="red-darken-4"
                aspect-ratio="1"
                :src="imgPreview"
                alt="Item Picture Preview"
                cover
              >
              </v-img>
            </v-col>

            <v-col cols="12" sm="6" md="8">
              <v-file-input
                class="mt-5"
                :rules="[imageValidator]"
                accept="image/png, image/jpeg, image/bmp"
                label="Browse Item Picture"
                placeholder="Browse Item Picture"
                prepend-icon="mdi-camera"
                show-size
                chips
              ></v-file-input>
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
            {{ isUpdate ? 'Update Item' : 'Add Item' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
