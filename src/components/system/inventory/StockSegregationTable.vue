<script setup>
import { getAvatarText, getMoneyText, getPadLeftText, getPreciseNumber } from '@/utils/helpers'
import { useStockSegregationTable } from '@/composables/system/inventory/stockSegregationTable'
import StockSegregateFormDialog from './segregation/StockSegregateFormDialog.vue'
import StockWeightFormDialog from './segregation/StockWeightFormDialog.vue'
import StockPriceFormDialog from './segregation/StockPriceFormDialog.vue'
import AlertNotification from '@/components/common/AlertNotification.vue'
import { tableHeaders } from './stockSegregationTableUtils'
import CodeFormDialog from './CodeFormDialog.vue'
import { useDisplay } from 'vuetify'

// Utilize pre-defined vue functions
const { mobile } = useDisplay()

// Utilized Composable
const {
  date,
  tableOptions,
  tableFilters,
  isWeightFormDialogVisible,
  isSegregateFormDialogVisible,
  isPriceFormDialogVisible,
  isCodeFormDialogVisible,
  itemData,
  formAction,
  onCodeVerified,
  onUpdateWeight,
  onUpdateSegregate,
  onUpdatePrice,
  onFilterDate,
  onFilterItems,
  onSearchItems,
  onLoadItems,
  productsStore,
  branchesStore,
  stockInStore
} = useStockSegregationTable()
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
                <br />
                <span class="font-weight-bold">Unit Price:</span>
                {{ getMoneyText(item.unit_price) }} / {{ item.unit_price_metric }}
              </p>
            </div>
          </div>
        </template>

        <template #item.qty="{ item }">
          <span class="font-weight-bold">
            {{ item.qty + ' ' + item.qty_metric }}
          </span>
        </template>

        <template #item.qty_reweighed="{ item }">
          <span class="font-weight-bold">
            {{ item.qty_reweighed ? item.qty_reweighed + ' ' + item.qty_metric : '-' }}
          </span>
        </template>

        <template #item.weight_loss="{ item }">
          <span class="font-weight-bold">
            {{
              item.qty_reweighed
                ? getPreciseNumber(item.qty - item.qty_reweighed) + ' ' + item.qty_metric
                : '-'
            }}
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
                <li>
                  <span class="font-weight-bold">Purchased Date:</span>
                  {{ date.format(item.purchased_at, 'fullDate') }}
                </li>
                <li>
                  <span class="font-weight-bold">Expiration Date:</span>
                  {{ item.expired_at ? date.format(item.expired_at, 'fullDate') : 'n/a' }}
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
              @click="onUpdateWeight(item)"
              :disabled="item.is_portion || item.is_segregated"
              icon
            >
              <v-icon icon="mdi-weight-kilogram"></v-icon>
              <v-tooltip activator="parent" location="top">Reweight Stock</v-tooltip>
            </v-btn>

            <v-btn
              variant="text"
              density="comfortable"
              @click="onUpdateSegregate(item)"
              :disabled="item.is_portion || item.is_segregated"
              icon
            >
              <v-icon icon="mdi-scale"></v-icon>
              <v-tooltip activator="parent" location="top">Segregate Stock</v-tooltip>
            </v-btn>

            <v-btn
              variant="text"
              density="comfortable"
              @click="onUpdatePrice(item)"
              :disabled="!item.is_portion"
              color="error"
              icon
            >
              <v-icon icon="mdi-tag-text"></v-icon>
              <v-tooltip activator="parent" location="top">Modify Price</v-tooltip>
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

  <StockWeightFormDialog
    v-model:is-dialog-visible="isWeightFormDialogVisible"
    :item-data="itemData"
    :table-options="tableOptions"
    :table-filters="tableFilters"
  ></StockWeightFormDialog>

  <StockSegregateFormDialog
    v-model:is-dialog-visible="isSegregateFormDialogVisible"
    :item-data="itemData"
    :table-options="tableOptions"
    :table-filters="tableFilters"
  ></StockSegregateFormDialog>

  <StockPriceFormDialog
    v-model:is-dialog-visible="isPriceFormDialogVisible"
    :item-data="itemData"
    :table-options="tableOptions"
    :table-filters="tableFilters"
  ></StockPriceFormDialog>
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
