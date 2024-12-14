<script setup>
import { getAccumulatedNumber, getMoneyText, getPreciseNumber } from '@/utils/helpers'
import { requiredValidator, betweenValidator } from '@/utils/validators'
import { useDisplay } from 'vuetify'
import { useDate } from 'vuetify'
import { ref } from 'vue'

const props = defineProps(['isDialogVisible', 'soldData'])

const emit = defineEmits(['update:isDialogVisible'])

// Utilize pre-defined vue functions
const date = useDate()
const { mdAndDown } = useDisplay()

// Load Variables
const formDataDefault = {
  cash: 0
}
const formData = ref({
  ...formDataDefault
})

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
      prepend-icon="mdi-account-credit-card"
      title="Customer Payments"
      :subtitle="`Branch: ${props.soldData.branches.name}`"
    >
      <v-card-text>
        {{ props.soldData }}

        <v-list>
          <v-list-item
            lines="two"
            v-for="(item, index) in props.soldData.customer_payments"
            :key="index"
            :title="date.format(item.created_at, 'fullDateTime')"
          >
            <template #append>
              <h3>
                {{ getMoneyText(item.payment) }}
              </h3>
            </template>
          </v-list-item>

          <v-divider thickness="2"></v-divider>

          <v-list-item lines="two">
            <template #title>
              <h3>Partial Payment(s)</h3>
            </template>

            <template #append>
              <h3>
                {{
                  getMoneyText(getAccumulatedNumber(props.soldData.customer_payments, 'payment'))
                }}
              </h3>
            </template>
          </v-list-item>

          <v-list-item lines="two">
            <template #title>
              <h3>Balance</h3>
            </template>

            <template #append>
              <h3>
                {{
                  getMoneyText(
                    getPreciseNumber(
                      props.soldData.overall_price -
                        getAccumulatedNumber(props.soldData.customer_payments, 'payment')
                    )
                  )
                }}
              </h3>
            </template>
          </v-list-item>

          <v-list-item lines="two">
            <v-text-field
              v-model="formData.cash"
              prepend-inner-icon="mdi-currency-php"
              label="Pay Amount"
              type="number"
              variant="underlined"
              min="0"
              :rules="[requiredValidator, betweenValidator(formData.cash, 0.001, 999999.999)]"
              autofocus
              reverse
            ></v-text-field>
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
