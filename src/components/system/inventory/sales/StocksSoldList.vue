<script setup>
import { getMoneyText, getPreciseNumber } from '@/utils/helpers'
import { watch } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps(['listData'])

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()

// Load Variables
const formDataDefault = {
  qty: '',
  discount: ''
}

// Monitor itemData if it has data
watch(
  () => props.listData,
  () => {}
)
</script>

<template>
  <section>
    <v-row dense>
      <v-col cols="12" class="d-flex justify-end">
        <v-btn variant="text" density="compact" icon>
          <v-icon icon="mdi-refresh"></v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-divider class="my-3"></v-divider>

    <v-list lines="one" v-for="(item, index) in props.listData" :key="index">
      <v-list-group :value="item.product.products.name" color="error" fluid>
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            :prepend-avatar="mdAndDown ? undefined : item.product.products.image_url"
            :title="item.product.products.name"
            :subtitle="
              item.qty +
              ' x ' +
              getMoneyText(item.product.unit_price) +
              ' per ' +
              item.product.unit_price_metric
            "
          >
            <template #append>
              <div class="me-1">
                <span class="text-body-2 font-weight-bold">
                  {{ getMoneyText(getPreciseNumber(item.qty * item.product.unit_price)) }}
                </span>
                <div>
                  <span class="text-caption">Discount</span>
                </div>
              </div>

              <v-btn variant="text" density="compact" icon>
                <v-icon icon="mdi-delete"></v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </template>

        <v-list-item>
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                class="mt-2"
                variant="outlined"
                density="compact"
                label="Weight / Qty"
                :suffix="item.product.unit_price_metric"
                type="number"
                min="1"
              ></v-text-field>
            </v-col>

            <v-col cols="6">
              <v-text-field
                class="mt-2"
                variant="outlined"
                density="compact"
                label="Discount"
                suffix="%"
                type="number"
                min="0"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-list-item>
      </v-list-group>
    </v-list>

    <v-row class="position-absolute bottom-0 left-0 right-0 pa-4" dense>
      <v-col cols="12" class="bg-primary w-100">
        <v-btn variant="text"> Add </v-btn>

        <v-btn variant="text"> Discount </v-btn>
      </v-col>

      <v-col cols="12">
        <ul class="ms-5">
          <li>Subtotal</li>
          <li>Tax</li>
        </ul>
        <h3>Payable Amount</h3>
      </v-col>

      <v-divider class="my-3"></v-divider>

      <v-col cols="12">
        <v-btn block>Proceed</v-btn>
      </v-col>

      <div style="height: 10rem"></div>
    </v-row>
  </section>
</template>
