<script setup>
import { getMoneyText, getPreciseNumber } from '@/utils/helpers'
import { useSalesStore } from '@/stores/sales'
import { useDisplay } from 'vuetify'

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()

// Use Pinia Store
const salesStore = useSalesStore()

// Set Discounted Price
const onDiscountPrice = (item) => {
  if (item.is_cash_discount) item.discounted_price = item.total_price - Number(item.discount)
  else item.discounted_price = item.total_price - item.total_price * (Number(item.discount) / 100)
}

// Toggle Discount either Percentage or Cash
const onDiscountToggle = (item) => {
  item.is_cash_discount = !item.is_cash_discount
  onDiscountPrice(item)
}
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

    <v-list lines="one" v-for="(item, index) in salesStore.stocksCart" :key="index">
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
                  {{ getMoneyText(getPreciseNumber(item.discounted_price)) }}
                </span>
                <div v-if="item.discount > 0">
                  <span class="text-caption text-decoration-line-through">
                    {{ getMoneyText(getPreciseNumber(item.total_price)) }}
                  </span>
                </div>
              </div>

              <v-btn variant="text" density="compact" @click="console.log('delete')" icon>
                <v-icon icon="mdi-delete"></v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </template>

        <v-list-item>
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model="item.qty"
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
                v-model="item.discount"
                class="mt-2"
                variant="outlined"
                density="compact"
                :label="item.is_cash_discount ? 'Cash Discount' : 'Discount (%)'"
                :prepend-inner-icon="item.is_cash_discount ? 'mdi-currency-php' : undefined"
                type="number"
                min="0"
                :append-icon="item.is_cash_discount ? 'mdi-cash' : 'mdi-sale'"
                @click:append="onDiscountToggle(item)"
                @update:model-value="onDiscountPrice(item)"
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
