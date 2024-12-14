<script setup>
import { getAccumulatedNumber, getMoneyText, getPreciseNumber } from '@/utils/helpers'
import { useDisplay } from 'vuetify'

const props = defineProps(['isDialogVisible', 'soldData'])

const emit = defineEmits(['update:isDialogVisible'])

// Utilize pre-defined vue functions
const { mdAndDown } = useDisplay()

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
      prepend-icon="mdi-cart"
      title="Products Sold Information"
      :subtitle="`Branch: ${props.soldData.branches.name}`"
    >
      <v-card-text>
        <v-list>
          <v-list-item lines="two">
            <template #title>
              <h3>Customer</h3>
            </template>

            <template #append>
              <h3>
                {{ props.soldData.customers ? props.soldData.customers.customer : '-' }}
              </h3>
            </template>
          </v-list-item>

          <v-divider thickness="2"></v-divider>

          <v-list-item
            lines="two"
            v-for="(item, index) in props.soldData.sale_products"
            :key="index"
            :prepend-avatar="item.products.image_url"
            :title="item.products.name"
            :subtitle="`${item.qty} x ${getMoneyText(item.unit_price)} `"
          >
            <template #append>
              <div class="me-1">
                <span class="text-body-2 font-weight-bold">
                  {{ getMoneyText(item.discounted_price) }}
                </span>
                <div v-if="item.discount > 0">
                  <span class="text-caption text-decoration-line-through">
                    {{ getMoneyText(getPreciseNumber(item.qty * item.unit_price)) }}
                  </span>
                </div>
              </div>
            </template>
          </v-list-item>

          <v-divider thickness="2"></v-divider>

          <v-list-item v-if="props.soldData.discount > 0" lines="two">
            <template #title>
              <h3>Discount</h3>
            </template>

            <template #append>
              <h3>
                {{
                  props.soldData.is_cash_discount
                    ? getMoneyText(props.soldData.discount)
                    : props.soldData.discount + '%'
                }}
              </h3>
            </template>
          </v-list-item>

          <v-list-item lines="two">
            <template #title>
              <h2>
                {{
                  props.soldData.customer_payments.length === 0
                    ? 'Full Payment'
                    : 'Partial Payment(s)'
                }}
              </h2>
            </template>

            <template #append>
              <h2>
                {{
                  props.soldData.customer_payments.length === 0
                    ? getMoneyText(props.soldData.overall_price)
                    : getMoneyText(
                        getAccumulatedNumber(props.soldData.customer_payments, 'payment')
                      )
                }}
              </h2>
            </template>
          </v-list-item>

          <v-list-item v-if="props.soldData.customer_payments.length > 0" lines="two">
            <template #title>
              <h1>Balance</h1>
            </template>

            <template #append>
              <h1>
                {{
                  getMoneyText(
                    getPreciseNumber(
                      props.soldData.overall_price -
                        getAccumulatedNumber(props.soldData.customer_payments, 'payment')
                    )
                  )
                }}
              </h1>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>

        <v-btn text="Close" variant="plain" prepend-icon="mdi-close" @click="onClose"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
