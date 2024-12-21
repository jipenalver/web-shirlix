<script setup>
import AlertNotification from '@/components/common/AlertNotification.vue'
import { formActionDefault, formDataMetrics } from '@/utils/supabase.js'
import { requiredValidator, betweenValidator } from '@/utils/validators'
import { useBranchesStore } from '@/stores/branches'
import { useProductsStore } from '@/stores/products'
import { useStockInStore } from '@/stores/stockIn'
import { onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps(['isDialogVisible', 'itemData', 'tableOptions', 'tableFilters'])

const emit = defineEmits(['update:isDialogVisible'])

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()

// Use Pinia Store
const productsStore = useProductsStore()
const branchesStore = useBranchesStore()
const stockInStore = useStockInStore()

// Load Variables
const formDataDefault = {
  remarks: '',
  qty: 1,
  qty_reweighed: 0,
  qty_metric: 'kg',
  branch_id: null,
  product_id: null
}
const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})
const refVForm = ref()
const imgPreview = ref('/images/img-product.png')

// Monitor itemData if it has data
watch(
  () => props.itemData,
  () => {
    formData.value = { ...props.itemData, is_reweighed: true }
    imgPreview.value = formData.value.products.image_url ?? '/images/img-product.png'
  }
)

// Submit Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  const { data, error } = await stockInStore.updateStockIn(formData.value)

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    // Turn off processing
    formAction.value.formProcess = false
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Updated Stock Weight.'

    await stockInStore.getStockInTable(props.tableOptions, props.tableFilters)

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

// Load Functions during component rendering
onMounted(async () => {
  if (branchesStore.branches.length == 0) await branchesStore.getBranches()
  if (productsStore.products.length == 0) await productsStore.getProducts()
})
</script>

<template>
  <v-dialog
    :max-width="mdAndDown ? undefined : '800'"
    :model-value="props.isDialogVisible"
    :fullscreen="mdAndDown"
    persistent
  >
    <v-card prepend-icon="mdi-weight-kilogram" title="Stock Re-weight">
      <AlertNotification
        :form-success-message="formAction.formSuccessMessage"
        :form-error-message="formAction.formErrorMessage"
      ></AlertNotification>

      <v-form ref="refVForm" @submit.prevent="onFormSubmit">
        <v-card-text>
          <v-row dense>
            <v-col cols="12" sm="6" md="4">
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

            <v-col cols="12" sm="6" md="8" class="d-flex align-center">
              <v-autocomplete
                v-model="formData.product_id"
                label="Product"
                :items="productsStore.products"
                item-title="name"
                item-value="id"
                return-object
                readonly
              ></v-autocomplete>
            </v-col>

            <v-col cols="12">
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

            <v-col cols="9" sm="4">
              <v-text-field
                v-model="formData.qty"
                label="Original Weight / Qty"
                type="number"
                min="1"
                readonly
              ></v-text-field>
            </v-col>

            <v-col cols="3" sm="2">
              <v-select
                v-model="formData.qty_metric"
                label="Metric"
                :items="formDataMetrics"
                readonly
              ></v-select>
            </v-col>

            <v-col cols="9" sm="4">
              <v-text-field
                v-model="formData.qty_reweighed"
                label="Re-weighed Weight / Qty"
                type="number"
                min="1"
                :rules="[requiredValidator, betweenValidator(formData.qty, 0.001, 999999.999)]"
              ></v-text-field>
            </v-col>

            <v-col cols="3" sm="2">
              <v-select
                v-model="formData.qty_metric"
                label="Metric"
                :items="formDataMetrics"
                readonly
              ></v-select>
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="formData.remarks" label="Remarks" rows="2"></v-textarea>
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
            Update Stock
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
