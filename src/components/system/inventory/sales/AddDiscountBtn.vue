<script setup>
import { ref } from 'vue'

const emit = defineEmits(['formData'])

// Load Variables
const formData = ref({
  discount: '',
  is_cash_discount: false
})
const isAddDiscountBtnClicked = ref(false)

// Emit components input
const onEmitCustomer = () => {
  emit('formData', formData.value)
}
</script>

<template>
  <div>
    <v-text-field
      v-if="isAddDiscountBtnClicked"
      v-model="formData.discount"
      density="compact"
      :label="formData.is_cash_discount ? 'Cash Discount' : 'Discount'"
      :prepend-inner-icon="formData.is_cash_discount ? 'mdi-currency-php' : 'mdi-percent'"
      :append-inner-icon="formData.is_cash_discount ? 'mdi-cash' : 'mdi-sale'"
      append-icon="mdi-close"
      type="number"
      min="0"
      hide-details
      @click:append-inner="formData.is_cash_discount = !formData.is_cash_discount"
      @click:append="isAddDiscountBtnClicked = false"
      @update:model-value="onEmitCustomer"
    ></v-text-field>

    <v-btn
      v-else
      variant="elevated"
      prepend-icon="mdi-sale"
      @click="isAddDiscountBtnClicked = true"
      block
    >
      Add Discount
    </v-btn>
  </div>
</template>
