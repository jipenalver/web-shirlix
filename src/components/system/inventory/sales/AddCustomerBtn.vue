<script setup>
import { ref } from 'vue'

const emit = defineEmits(['formData'])

// Load Variables
const formData = ref({
  customer: ''
})
const isAddCustomerBtnClicked = ref(false)

// Emit components input
const onEmitCustomer = (customer) => {
  emit('formData', customer)
}
</script>

<template>
  <div>
    <v-text-field
      v-if="isAddCustomerBtnClicked"
      v-model="formData.customer"
      label="Customer Name"
      density="compact"
      prepend-inner-icon="mdi-account-tie"
      append-icon="mdi-close"
      @click:append="isAddCustomerBtnClicked = false"
      hide-details
      @update:model-value="onEmitCustomer"
    ></v-text-field>

    <v-btn
      v-else
      variant="elevated"
      prepend-icon="mdi-account-tie"
      @click="isAddCustomerBtnClicked = true"
      block
    >
      Add Customer
    </v-btn>
  </div>
</template>
