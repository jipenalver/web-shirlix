<script setup>
import { getAvatarText, getMoneyText, getPadLeftText } from '@/utils/helpers'
import { useStockInTable } from '@/composables/system/inventory/stockInTable'
import AlertNotification from '@/components/common/AlertNotification.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import StockInFormDialog from './stockin/StockInFormDialog.vue'
import { tableHeaders } from './stockInTableUtils'
import CodeFormDialog from './CodeFormDialog.vue'
import { useDisplay } from 'vuetify'

// Utilize pre-defined vue functions
const { mobile } = useDisplay()

// Utilized Composable
const {
  date,
  tableOptions,
  tableFilters,
  isCodeFormDialogVisible,
  isStockInFormDialogVisible,
  isConfirmDeleteDialog,
  itemData,
  formAction,
  onCodeVerified,
  onAdd,
  onUpdate,
  onDelete,
  onConfirmDelete,
  onFilterDate,
  onFilterItems,
  onSearchItems,
  onLoadItems,
  productsStore,
  branchesStore,
  stockInStore
} = useStockInTable()
</script>

<template>
  <AlertNotification
    :form-success-message="formAction.formSuccessMessage"
    :form-error-message="formAction.formErrorMessage"
  ></AlertNotification>

  <v-row>
    <v-col cols="12">
      <!-- eslint-disable vue/valid-v-slot -->
      <v-data-table-server
        v-model:items-per-page="tableOptions.itemsPerPage"
        v-model:page="tableOptions.page"
        v-model:sort-by="tableOptions.sortBy"
        :loading="tableOptions.isLoading"
        :headers="tableHeaders"
        :items="stockInStore.stockInTable"
        :items-length="stockInStore.stockInTotal"
        @update:options="onLoadItems"
        :hide-default-header="mobile"
        :mobile="mobile"
      >
        <template #top>
          <v-row dense>
            <v-col cols="12" sm="4">
              <v-autocomplete
                v-model="tableFilters.product_id"
                :items="productsStore.products"
                density="compact"
                label="Product"
                item-title="name"
                item-value="id"
                clearable
                @update:model-value="onFilterItems"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" sm="4">
              <v-autocomplete
                v-model="tableFilters.branch_id"
                :items="branchesStore.branches"
                density="compact"
                label="Branch"
                item-title="name"
                item-value="id"
                clearable
                @update:model-value="onFilterItems"
              ></v-autocomplete>
            </v-col>

            <v-col cols="12" sm="4">
              <v-date-input
                v-model="tableFilters.purchased_at"
                density="compact"
                label="Date Purchased"
                multiple="range"
                clearable
                @click:clear="onFilterDate(true)"
                @update:model-value="onFilterDate(false)"
              ></v-date-input>
            </v-col>
          </v-row>

          <v-divider class="mb-5"></v-divider>

          <v-row dense>
            <v-spacer></v-spacer>

            <v-col cols="12" sm="5">
              <v-text-field
                v-model="tableFilters.search"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                placeholder="Search by ID, Supplier or Remarks"
                clearable
                @click:clear="onSearchItems"
                @input="onSearchItems"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="3">
              <v-btn class="my-1" prepend-icon="mdi-plus" color="red-darken-4" block @click="onAdd">
                Add Stock
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-5"></v-divider>
        </template>

        <template #item.id="{ item }">
          <span class="font-weight-bold">
            {{ getPadLeftText(item.id) }}
          </span>
        </template>

        <template #item.products="{ item }">
          <div
            class="td-first"
            :class="mobile ? '' : 'd-flex align-center'"
            :style="mobile ? 'height: auto' : ''"
          >
            <div class="me-2">
              <v-img
                v-if="item.products.image_url"
                class="rounded-circle td-first-img"
                :class="mobile ? 'ml-auto my-2' : ''"
                color="red-darken-4"
                aspect-ratio="1"
                :src="item.products.image_url"
                alt="Product Picture"
                cover
              >
              </v-img>

              <v-avatar v-else color="red-darken-4" size="x-large">
                <span class="text-h5">
                  {{ getAvatarText(item.products.name) }}
                </span>
              </v-avatar>
            </div>

            <div>
              <span class="font-weight-bold">
                {{ item.products.name }}
              </span>
              <p class="text-caption">{{ item.products.description }}</p>
              <p class="text-caption" v-if="item.unit_cost">
                <span class="font-weight-bold">Unit Cost:</span>
                {{ getMoneyText(item.unit_cost) }}
              </p>
              <p class="text-caption" v-if="item.total_cost">
                <span class="font-weight-bold">Total Cost:</span>
                {{ getMoneyText(item.total_cost) }}
              </p>
              <p class="text-caption" v-else-if="item.is_portion">
                <span class="font-weight-bold">Portion of ID:</span>
                {{ getPadLeftText(item.stock_in_id) }}
              </p>
            </div>
          </div>
        </template>

        <template #item.qty="{ item }">
          <span class="font-weight-bold">
            {{ item.qty + ' ' + item.qty_metric }}
          </span>
        </template>

        <template #item.purchased_at="{ item }">
          <span class="font-weight-bold">
            {{ date.format(item.purchased_at, 'fullDate') }}
          </span>
        </template>

        <template #item.expired_at="{ item }">
          <span class="font-weight-bold">
            {{ item.expired_at ? date.format(item.expired_at, 'fullDate') : 'n/a' }}
          </span>
        </template>

        <template #item.status="{ item }">
          <v-chip class="font-weight-bold cursor-pointer" prepend-icon="mdi-information">
            {{
              item.is_portion
                ? 'Stock Portion'
                : item.is_segregated
                  ? 'Segregated'
                  : item.is_reweighed
                    ? 'Reweighed'
                    : 'For Re-Weighing'
            }}

            <v-tooltip activator="parent" location="top" open-on-click>
              <ul class="ms-2">
                <li>
                  <span class="font-weight-bold">Added Date:</span>
                  {{ date.format(item.created_at, 'fullDateTime') }}
                </li>
                <li><span class="font-weight-bold">Supplier:</span> {{ item.supplier }}</li>
                <li><span class="font-weight-bold">Branch:</span> {{ item.branches.name }}</li>
                <li><span class="font-weight-bold">Remarks:</span> {{ item.remarks }}</li>
              </ul>
            </v-tooltip>
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex align-center" :class="mobile ? 'justify-end' : 'justify-center'">
            <v-btn
              variant="text"
              density="comfortable"
              @click="onUpdate(item)"
              :disabled="item.is_portion || item.is_segregated"
              icon
            >
              <v-icon icon="mdi-pencil"></v-icon>
              <v-tooltip activator="parent" location="top">Edit Stock</v-tooltip>
            </v-btn>

            <v-btn
              variant="text"
              density="comfortable"
              @click="onDelete(item.id)"
              :disabled="item.is_portion || item.is_segregated"
              icon
            >
              <v-icon icon="mdi-trash-can" color="red-darken-4"></v-icon>
              <v-tooltip activator="parent" location="top">Delete Stock</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>

  <CodeFormDialog
    v-model:is-dialog-visible="isCodeFormDialogVisible"
    @is-code-verified="onCodeVerified"
  ></CodeFormDialog>

  <StockInFormDialog
    v-model:is-dialog-visible="isStockInFormDialogVisible"
    :item-data="itemData"
    :table-options="tableOptions"
    :table-filters="tableFilters"
  ></StockInFormDialog>

  <ConfirmDialog
    v-model:is-dialog-visible="isConfirmDeleteDialog"
    title="Confirm Delete"
    text="Are you sure you want to delete stock?"
    @confirm="onConfirmDelete"
  ></ConfirmDialog>
</template>

<style scoped>
.td-first {
  height: 100px;
  min-width: 200px;
}

.td-first-img {
  width: 65px;
}
</style>
