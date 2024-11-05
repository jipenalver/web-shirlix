<script setup>
import { useAuthUserStore } from '@/stores/authUser'
import { useProductsStore } from '@/stores/products'
import AlertNotification from '@/components/common/AlertNotification.vue'
import { requiredValidator, imageValidator } from '@/utils/validators'
import { formActionDefault } from '@/utils/supabase.js'
import { fileExtract } from '@/utils/helpers'
import { ref, watch } from 'vue'

const props = defineProps(['isDialogVisible', 'itemData', 'tableOptions', 'tableFilters'])

const emit = defineEmits(['update:isDialogVisible'])

// Use Pinia Store
const productsStore = useProductsStore()
const authStore = useAuthUserStore()

// Load Variables
const formDataDefault = {
  name: '',
  description: '',
  image: null,
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

// Monitor itemData if it has data
watch(
  () => props.itemData,
  () => {
    isUpdate.value = props.itemData ? true : false
    formData.value = props.itemData ? { ...props.itemData } : { ...formDataDefault }
  }
)

// Function to handle file change and show image preview
const onPreview = async (event) => {
  const { fileObject, fileUrl } = await fileExtract(event)
  // Update formData
  formData.value.image = fileObject
  // Update imgPreview state
  imgPreview.value = fileUrl
}

// Function to reset preview if file-input clear is clicked
const onPreviewReset = () => {
  imgPreview.value = '/images/img-product.png'
}

// Submit Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  // Check if isUpdate is true, then do update, if false do add
  const { data, error } = isUpdate.value
    ? await productsStore.updateProduct(formData.value)
    : await productsStore.addProduct(formData.value)

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    // Turn off processing
    formAction.value.formProcess = false
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Added Product.'

    await productsStore.getProductsTable(props.tableOptions, props.tableFilters)

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
  <v-dialog max-width="800" :model-value="props.isDialogVisible" persistent>
    <v-card prepend-icon="mdi-information-box" title="Product Information">
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

            <v-col cols="12" md="4">
              <v-img
                width="55%"
                class="mx-auto rounded-circle"
                color="red-darken-4"
                aspect-ratio="1"
                :src="imgPreview"
                alt="Product Picture Preview"
                cover
              >
              </v-img>
            </v-col>

            <v-col cols="12" md="8">
              <v-file-input
                class="mt-5"
                :rules="[imageValidator]"
                accept="image/png, image/jpeg, image/bmp"
                label="Browse Product Picture"
                placeholder="Browse Product Picture"
                prepend-icon="mdi-camera"
                show-size
                chips
                @change="onPreview"
                @click:clear="onPreviewReset"
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
            {{ isUpdate ? 'Update Product' : 'Add Product' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
