<script setup>
import { betweenValidator, compareDatesValidator, requiredValidator } from '@/utils/validators'
import AlertNotification from '@/components/common/AlertNotification.vue'
import { formActionDefault, formDataMetrics } from '@/utils/supabase.js'
import { useBranchesStore } from '@/stores/branches'
import { useProductsStore } from '@/stores/products'
import { useStockInStore } from '@/stores/stockIn'
import { getPreciseNumber } from '@/utils/helpers'
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
  supplier: '',
  remarks: '',
  total_cost: undefined,
  unit_cost: undefined,
  qty: undefined,
  qty_metric: 'kg',
  purchased_at: new Date(),
  expired_at: null,
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
const isUpdate = ref(false)
const imgPreview = ref('/images/img-product.png')
const repetition = ref(1)

// Monitor itemData if it has data
watch(
  () => props.isDialogVisible,
  () => {
    isUpdate.value = props.itemData ? true : false
    formData.value = props.itemData
      ? {
          ...props.itemData,
          purchased_at: new Date(props.itemData.purchased_at),
          expired_at: props.itemData.expired_at ? new Date(props.itemData.expired_at) : null
        }
      : { ...formDataDefault }
    imgPreview.value = isUpdate.value
      ? formData.value.products.image_url
      : '/images/img-product.png'
    formData.value.unit_cost = isUpdate.value
      ? formData.value.total_cost / formData.value.qty
      : undefined
  }
)

// Function to handle file change and show image preview
const onPreview = async (value) => {
  // Update imgPreview state
  imgPreview.value = value.image_url ?? '/images/img-product.png'
}

// Submit Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  const { id } = formData.value.product_id
  formData.value.product_id = id

  // Check if isUpdate is true, then do update, if false do add
  const { data, error } = isUpdate.value
    ? await stockInStore.updateStockIn(formData.value)
    : await stockInStore.addStockIn(formData.value, repetition.value)

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    // Turn off processing
    formAction.value.formProcess = false
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = isUpdate.value
      ? 'Successfully Updated Stock Information.'
      : 'Successfully Added Stock.'

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
  formData.value = { ...formDataDefault }
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
    <v-card prepend-icon="mdi-information-box" title="Stock Information">
      <template #subtitle>
        <div class="text-wrap">
          <b class="text-error">Please review the entered values carefully before submitting.</b>
        </div>
      </template>

      <template v-if="!isUpdate" #append>
        <v-text-field
          width="125px"
          v-model="repetition"
          prepend-inner-icon="mdi-sync"
          density="compact"
          label="Input Repetition"
          variant="outlined"
          type="number"
          min="1"
          :rules="[betweenValidator(repetition, 1, 50)]"
          hide-details
        ></v-text-field>
      </template>

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
                @update:model-value="onPreview"
                :rules="[requiredValidator]"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" sm="6">
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

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.supplier"
                label="Supplier Name"
                :rules="[requiredValidator]"
              ></v-text-field>
            </v-col>

            <v-col cols="9" sm="3">
              <v-text-field
                v-model="formData.qty"
                label="Weight / Qty"
                type="number"
                min="0"
                :rules="[requiredValidator, betweenValidator(formData.qty, 0.001, 999999.999)]"
                hint="Please select correct metric"
                @update:model-value="
                  formData.total_cost = getPreciseNumber(formData.unit_cost * formData.qty)
                "
              ></v-text-field>
            </v-col>

            <v-col cols="3" sm="2">
              <v-select
                v-model="formData.qty_metric"
                label="Metric"
                :items="formDataMetrics"
                :rules="[requiredValidator]"
              ></v-select>
            </v-col>

            <v-col cols="12" sm="3">
              <v-text-field
                v-model="formData.unit_cost"
                prefix="Php"
                label="Unit Cost"
                type="number"
                min="0"
                :rules="[
                  requiredValidator,
                  betweenValidator(formData.unit_cost, 0.001, 999999.999)
                ]"
                @update:model-value="
                  formData.total_cost = getPreciseNumber(formData.unit_cost * formData.qty)
                "
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="4">
              <v-text-field
                v-model="formData.total_cost"
                prefix="Php"
                label="Total Cost of Stock"
                type="number"
                min="0"
                :rules="[requiredValidator]"
                hint="Weight / Qty x Unit Cost"
                persistent-hint
                readonly
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-date-input
                v-model="formData.purchased_at"
                label="Purchased Date"
                :rules="[requiredValidator]"
                hide-actions
              ></v-date-input>
            </v-col>

            <v-col cols="12" sm="6">
              <v-date-input
                v-model="formData.expired_at"
                label="Expiration Date"
                clearable
                :rules="[
                  compareDatesValidator(
                    formData.expired_at,
                    formData.purchased_at,
                    '>=',
                    'expiration',
                    'purchased'
                  )
                ]"
                hide-actions
              ></v-date-input>
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
            {{ isUpdate ? 'Update Stock' : 'Add Stock' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
