<script setup>
import {
  getAccumulatedNumber,
  getMoneyText,
  getPadLeftText,
  getPreciseNumber
} from '@/utils/helpers'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useReportsStore } from '@/stores/reports'
import { useDisplay } from 'vuetify'
import { useDate } from 'vuetify'
import { ref, watch } from 'vue'

const props = defineProps(['isDialogVisible', 'itemData', 'tableOptions', 'tableFilters'])

const emit = defineEmits(['update:isDialogVisible'])

// Utilize pre-defined vue functions
const date = useDate()
const { mdAndDown, xs } = useDisplay()

// Use Pinia Store
const reportsStore = useReportsStore()

// Load Variables
const isConfirmDialog = ref(false)
const itemQty = ref(0)

// Monitor itemData if it has data
watch(
  () => props.itemData,
  async () => {
    itemQty.value = props.itemData.stock_remaining
    await reportsStore.getStocksTransferList(props.itemData)
  }
)

// Calculate Stock Remaining
const getStockRemaining = (item) => {
  return getPreciseNumber(item.qty_reweighed - getAccumulatedNumber(item.sale_products, 'qty'))
}

// Trigger Transfer Btn
const onTransfer = () => {}

// Close Dialog
const onClose = () => {
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
    <v-card
      prepend-icon="mdi-transfer"
      title="Transfer Remaining"
      :subtitle="`Branch: ${props.itemData.branches.name}`"
    >
      <template #append>
        {{ xs ? '' : 'Transfer Weight / Qty:' }}&nbsp;
        <span class="font-weight-bold">
          {{ itemQty + ' ' + props.itemData.qty_metric }}
        </span>
      </template>

      <v-card-text>
        <v-list>
          <v-list-item
            lines="two"
            v-for="(item, index) in reportsStore.stocksTransferList"
            :key="index"
            :prepend-avatar="item.products.image_url"
            :title="item.products.name"
            :subtitle="`${getMoneyText(item.unit_price)} / ${item.unit_price_metric}`"
          >
            <template #append>
              <span class="font-weight-bold">
                {{
                  (xs ? '' : 'Rem. Weight / Qty: ') +
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

              <v-btn variant="text" density="comfortable" @click="isConfirmDialog = true" icon>
                <v-icon icon="mdi-transfer-down"></v-icon>
                <v-tooltip activator="parent" location="top">Transfer Remaining Qty</v-tooltip>
              </v-btn>
            </template>
          </v-list-item>

          <span v-if="reportsStore.stocksTransferList.length === 0">
            No identical products are available</span
          >
        </v-list>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>

        <v-btn text="Close" variant="plain" prepend-icon="mdi-close" @click="onClose"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <ConfirmDialog
    v-model:is-dialog-visible="isConfirmDialog"
    title="Confirm Transfer"
    text="Are you sure you want to transfer the remaining quantity?"
    @confirm="onTransfer"
  ></ConfirmDialog>
</template>
