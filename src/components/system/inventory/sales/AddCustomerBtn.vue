<script setup>
import { ref } from 'vue'

const emit = defineEmits(['formData'])

// Load Variables
const formDataDefault = {
  customer: ''
}
const formData = ref({
  ...formDataDefault
})
const isAddBtnClicked = ref(false)

// Emit components input
const onEmitForm = (customer) => {
  emit('formData', customer)
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
      v-model="formData.customer"
      label="Customer Name"
      density="compact"
      prepend-inner-icon="mdi-account-tie"
      append-icon="mdi-close"
      @click:append="onCancel"
      @update:model-value="onEmitForm"
      hide-details
    ></v-text-field>

    <v-btn
      v-else
      variant="elevated"
      prepend-icon="mdi-account-tie"
      @click="isAddBtnClicked = true"
      block
    >
      Add Customer
    </v-btn>
  </div>
</template>
