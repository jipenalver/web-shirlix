<script setup>
import {
  getAccumulatedNumber,
  getMoneyText,
  getPadLeftText,
  getPreciseNumber
} from '@/utils/helpers'
import AlertNotification from '@/components/common/AlertNotification.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { formActionDefault } from '@/utils/supabase.js'
import { requiredValidator } from '@/utils/validators'
import { useBranchesStore } from '@/stores/branches'
import { useStockInStore } from '@/stores/stockIn'
import { onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useDate } from 'vuetify'

const props = defineProps(['isDialogVisible', 'itemData', 'tableOptions', 'tableFilters'])

const emit = defineEmits(['update:isDialogVisible'])

// Utilize pre-defined vue functions
const date = useDate()
const { mdAndDown, xs } = useDisplay()

// Use Pinia Store
const branchesStore = useBranchesStore()
const stockInStore = useStockInStore()

// Load Variables
const formDataDefault = {
  remarks: '',
  branch_id: null
}
const formData = ref({
  ...formDataDefault
})
const formAction = ref({
  ...formActionDefault
})
const refVForm = ref()
const itemQty = ref(0)
const stocksTransferList = ref([])
const isConfirmDialog = ref(false)

// Monitor itemData if it has data
watch(
  () => props.itemData,
  () => {
    formData.value = { ...formDataDefault }
    itemQty.value = props.itemData.stock_remaining
  }
)

// Calculate Stock Remaining
const getStockRemaining = (item) => {
  return getPreciseNumber(item.qty_reweighed - getAccumulatedNumber(item.sale_products, 'qty'))
}

// Load List Data
const onLoadItems = async () => {
  if (!formData.value.branch_id) return

  stocksTransferList.value = await stockInStore.getStocksTransferList({
    ...props.itemData,
    branch_id: formData.value.branch_id
  })
}

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
      prepend-icon="mdi-transfer"
      title="Transfer Stock"
      :subtitle="`Origin Branch: ${props.itemData.branches.name}`"
    >
      <template #append>
        {{ xs ? '' : 'Transfer Weight / Qty:' }}&nbsp;
        <span class="font-weight-bold">
          {{ itemQty + ' ' + props.itemData.qty_metric }}
        </span>
      </template>

      <AlertNotification
        :form-success-message="formAction.formSuccessMessage"
        :form-error-message="formAction.formErrorMessage"
      ></AlertNotification>

      <v-form ref="refVForm" @submit.prevent="onFormSubmit">
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-autocomplete
                v-model="formData.branch_id"
                label="Destination Branch"
                :items="branchesStore.branches"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
                @update:model-value="onLoadItems"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12">
              <v-textarea v-model="formData.remarks" label="Add Remarks" rows="2"></v-textarea>
            </v-col>
          </v-row>

          <v-list>
            <div v-if="stocksTransferList.length > 0">
              <span class="ms-2 text-body-2"> Stocks in Destination Branch: </span>

              <v-divider class="mt-2 mb-5" thickness="2"></v-divider>
            </div>

            <v-list-item
              lines="two"
              v-for="(item, index) in stocksTransferList"
              :key="index"
              :prepend-avatar="item.products.image_url"
              :title="item.products.name"
              :subtitle="`${getMoneyText(item.unit_price)} / ${item.unit_price_metric}`"
            >
              <template #append>
                <span class="font-weight-bold">
                  {{
                    (xs ? '' : 'Remaining Weight / Qty: ') +
                    (getStockRemaining(item) + ' ' + item.qty_metric)
                  }}

                  <v-chip class="mx-n2 cursor-pointer" density="compact" variant="text">
                    <v-icon icon="mdi-information" size="small"></v-icon>
                  </v-chip>

                  <v-tooltip activator="parent" location="top" open-on-click>
                    <ul class="ms-2">
                      <li>
                        <span class="font-weight-bold">Stock ID:</span>
                        {{ getPadLeftText(item.id) }}
                      </li>
                      <li>
                        <span class="font-weight-bold">Purchased Date:</span>
                        {{ date.format(item.purchased_at, 'fullDate') }}
                      </li>
                      <li>
                        <span class="font-weight-bold">Expiration Date:</span>
                        {{ item.expired_at ? date.format(item.expired_at, 'fullDate') : 'n/a' }}
                      </li>
                      <li><span class="font-weight-bold">Supplier:</span> {{ item.supplier }}</li>
                    </ul>
                  </v-tooltip>
                </span>
              </template>
            </v-list-item>
          </v-list>
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
            Transfer Stock
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <ConfirmDialog
    v-model:is-dialog-visible="isConfirmDialog"
    title="Confirm Transfer"
    text="Are you sure you want to transfer the remaining quantity on destination branch?"
    @confirm="onFormSubmit"
  ></ConfirmDialog>
</template>
