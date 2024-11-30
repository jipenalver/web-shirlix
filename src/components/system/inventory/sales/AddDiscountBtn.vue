<script setup>
import { ref } from 'vue'

const emit = defineEmits(['formData'])

// Load Variables
const formDataDefault = {
  discount: 0,
  is_cash_discount: false
}
const formData = ref({
  ...formDataDefault
})
const isAddBtnClicked = ref(false)

// Emit components input
const onEmitForm = () => {
  emit('formData', formData.value)
}

// Cancel component
const onCancel = () => {
  formData.value = { ...formDataDefault }
  isAddBtnClicked.value = false
  onEmitForm()
}
</script>

<template>
  <div>
    <v-text-field
      v-if="isAddBtnClicked"
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
      @click:append="onCancel"
      @update:model-value="onEmitForm"
    ></v-text-field>

    <v-btn v-else variant="elevated" prepend-icon="mdi-sale" @click="isAddBtnClicked = true" block>
      Add Discount
    </v-btn>
  </div>
</template>
