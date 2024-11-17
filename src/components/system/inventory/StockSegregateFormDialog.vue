<script setup>
import { useProductsStore } from '@/stores/products'
import { useStockInStore } from '@/stores/stockIn'
import AlertNotification from '@/components/common/AlertNotification.vue'
import { requiredValidator } from '@/utils/validators'
import { formActionDefault, formDataMetrics } from '@/utils/supabase.js'
import { onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { getPreciseNumber } from '@/utils/helpers'

const props = defineProps(['isDialogVisible', 'itemData', 'tableOptions', 'tableFilters'])

const emit = defineEmits(['update:isDialogVisible'])

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()

// Use Pinia Store
const productsStore = useProductsStore()
const stockInStore = useStockInStore()

// Load Variables
const formDataPortionDefault = {
  stock_in_id: null,
  product_preview: '/images/img-product.png',
  product_id: null,
  qty: 0,
  qty_metric: 'kg',
  is_reweighed: true
}
const formDataDefault = {
  qty: 1,
  qty_reweighed: 1,
  qty_metric: 'kg',
  product_id: null,
  stocks: []
}
const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})
const refVForm = ref()
const imgPreview = ref('/images/img-product.png')
const remainingQty = ref(0)

// Monitor itemData if it has data
watch(
  () => props.itemData,
  () => {
    formData.value = { ...props.itemData, stocks: [] }
    imgPreview.value = formData.value.products.image_url ?? '/images/img-product.png'
    remainingQty.value = formData.value.qty_reweighed
    onAddPortion()
  }
)

// Function to handle file change and show image preview
const onPreview = async (item, value) => {
  // Update imgPreview state
  value.product_preview = item.image_url ?? '/images/img-product.png'
}

// Add Stock Portion
const onAddPortion = () => {
  formData.value.stocks.push({
    ...formDataPortionDefault,
    qty_metric: formData.value.qty_metric,
    supplier: formData.value.supplier,
    purchased_at: formData.value.purchased_at,
    expired_at: formData.value.expired_at,
    branch_id: formData.value.branch_id,
    stock_in_id: formData.value.id
  })
  calcRemainingQty()
}

// Remove Stock Portion
const onRemoveStock = () => {
  if (formData.value.stocks.length != 1) formData.value.stocks.pop()
  calcRemainingQty()
}

// Calculate remaining qty
const calcRemainingQty = () => {
  remainingQty.value = getPreciseNumber(
    formData.value.qty_reweighed -
      formData.value.stocks.reduce((acc, cur) => acc + Number(cur.qty), 0)
  )
}

// Submit Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  const { data, error } = await stockInStore.addStockPortion(formData.value.stocks)

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    // Turn off processing
    formAction.value.formProcess = false
  } else if (data) {
    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Segregated Stock.'

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
    <v-card
      prepend-icon="mdi-scale"
      title="Stock Segregate"
      subtitle="Stock portioning into cuts or component parts"
    >
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
          </v-row>

          <v-row dense>
            <v-col cols="12" sm="4" md="3" class="d-flex align-center justify-center">
              <span> Remaining Weight / Qty: {{ remainingQty }} </span>
            </v-col>

            <v-col cols="12" sm="8" md="9" class="d-flex justify-end">
              <v-btn
                text="Add Portion"
                variant="plain"
                prepend-icon="mdi-plus-thick"
                @click="onAddPortion"
              ></v-btn>

              <v-btn
                text="Decrease Portion"
                variant="plain"
                prepend-icon="mdi-minus-thick"
                @click="onRemoveStock"
              ></v-btn>
            </v-col>
          </v-row>

          <v-row dense>
            <template v-for="(value, index) in formData.stocks" :key="index">
              <v-divider class="mt-2 mb-5"></v-divider>

              <v-col cols="12" sm="6" md="4">
                <v-img
                  width="55%"
                  class="mx-auto rounded-circle"
                  color="red-darken-4"
                  aspect-ratio="1"
                  :src="value.product_preview"
                  alt="Product Picture Preview"
                  cover
                >
                </v-img>
              </v-col>

              <v-col cols="12" sm="6" md="8">
                <v-row dense>
                  <v-col cols="12">
                    <v-autocomplete
                      v-model="value.product_id"
                      label="Product"
                      :items="productsStore.products"
                      item-title="name"
                      item-value="id"
                      return-object
                      :rules="[requiredValidator]"
                      @update:model-value="(item) => onPreview(item, value)"
                    ></v-autocomplete>
                  </v-col>

                  <v-col cols="9">
                    <v-text-field
                      v-model="value.qty"
                      label="Portion Weight / Qty"
                      type="number"
                      min="0"
                      :max="remainingQty"
                      :rules="[requiredValidator]"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="3">
                    <v-select
                      v-model="value.qty_metric"
                      label="Metric"
                      :items="formDataMetrics"
                      readonly
                    ></v-select>
                  </v-col>
                </v-row>
              </v-col>
            </template>
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
            Stock Portioning
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
