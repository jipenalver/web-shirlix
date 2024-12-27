<script setup>
import { useProductsReport } from '@/composables/system/reports/productsReport'
import { getAvatarText } from '@/utils/helpers'
import { useDisplay } from 'vuetify'

// Utilize pre-defined vue functions
const { mobile } = useDisplay()

// Utilized Composable
const {
  date,
  tableHeaders,
  tableOptions,
  tableFilters,
  onFilterDate,
  onFilterItems,
  onGenerate,
  productsStore,
  branchesStore,
  reportsStore
} = useProductsReport()
</script>

<template>
  <v-row>
    <v-col cols="12">
      <!-- eslint-disable vue/valid-v-slot -->
      <v-data-table-server
        v-model:items-per-page="tableOptions.itemsPerPage"
        v-model:page="tableOptions.page"
        v-model:sort-by="tableOptions.sortBy"
        :loading="tableOptions.isLoading"
        :headers="tableHeaders"
        :items="reportsStore.productsReport"
        :items-length="reportsStore.productsReport.length"
        no-data-text="Use the above filter to display report"
        hide-default-footer
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
                v-model="tableFilters.date"
                density="compact"
                label="Date"
                hint="Please Select Date"
                clearable
                persistent-hint
                @click:clear="onFilterDate(true)"
                @update:model-value="onFilterDate(false)"
              ></v-date-input>
            </v-col>
          </v-row>

          <v-divider class="mb-5"></v-divider>

          <v-row dense>
            <v-spacer></v-spacer>

            <v-col cols="12" sm="3">
              <v-btn
                :disabled="reportsStore.productsReport.length == 0"
                class="my-1"
                prepend-icon="mdi-file-delimited"
                color="red-darken-4"
                block
                @click="onGenerate"
              >
                Generate CSV
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-5"></v-divider>
        </template>

        <template #item.date="{ item }">
          <span class="font-weight-bold">
            {{ date.format(item.date, 'fullDate') }}
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
                v-if="item.image_url"
                class="rounded-circle td-first-img"
                :class="mobile ? 'ml-auto my-2' : ''"
                color="red-darken-4"
                aspect-ratio="1"
                :src="item.image_url"
                alt="Product Picture"
                cover
              >
              </v-img>

              <v-avatar v-else color="red-darken-4" size="x-large">
                <span class="text-h5">
                  {{ getAvatarText(item.name) }}
                </span>
              </v-avatar>
            </div>

            <div>
              <span class="font-weight-bold">
                {{ item.name }}
              </span>
              <p class="text-caption">{{ item.description }}</p>
            </div>
          </div>
        </template>

        <template #item.stock_opening="{ item }">
          <span class="font-weight-bold">
            {{ item.stock_opening + ' ' + item.qty_metric }}
          </span>
        </template>

        <template #item.stock_in="{ item }">
          <span class="font-weight-black">
            {{ item.stock_in + ' ' + item.qty_metric }}
          </span>
        </template>

        <template #item.stock_sold="{ item }">
          <span class="font-weight-black">
            {{ item.stock_sold + ' ' + item.qty_metric }}
          </span>
        </template>

        <template #item.stock_transferred="{ item }">
          <span class="font-weight-bold">
            {{ item.stock_transferred + ' ' + item.qty_metric }}
          </span>
        </template>

        <template #item.stock_remaining="{ item }">
          <span class="font-weight-bold">
            {{ item.stock_remaining + ' ' + item.qty_metric }}
          </span>
        </template>
      </v-data-table-server>
    </v-col>
  </v-row>
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
