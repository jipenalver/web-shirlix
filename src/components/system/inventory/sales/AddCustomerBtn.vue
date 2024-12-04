<script setup>
import { useSalesStore } from '@/stores/sales'
import { ref, onMounted } from 'vue'

const emit = defineEmits(['formData'])

// Use Pinia Store
const salesStore = useSalesStore()

// Load Variables
const formDataDefault = {
  customer: ''
}
const formData = ref({
  ...formDataDefault
})
const isAddBtnClicked = ref(false)
const isKeyboardBtnClicked = ref(false)

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

// Reset Form
const onFormReset = () => {
  formData.value = { ...formDataDefault }
  isKeyboardBtnClicked.value = !isKeyboardBtnClicked.value
  onEmitForm()
}

// Load Functions during component rendering
onMounted(async () => {
  if (salesStore.customers.length == 0) await salesStore.getCustomers()
})
</script>

<template>
  <div>
    <div v-if="isAddBtnClicked">
      <v-text-field
        v-if="isKeyboardBtnClicked"
        v-model="formData.customer"
        label="Input Customer Name"
        density="compact"
        prepend-inner-icon="mdi-account-tie"
        append-icon="mdi-close"
        append-inner-icon="mdi-magnify"
        @click:append-inner="onFormReset"
        @click:append="onCancel"
        @update:model-value="onEmitForm"
        hide-details
      ></v-text-field>

      <v-autocomplete
        v-else
        v-model="formData.customer"
        label="Select Customer"
        density="compact"
        :items="salesStore.customers"
        item-title="customer"
        item-value="id"
        prepend-inner-icon="mdi-account-tie"
        append-icon="mdi-close"
        append-inner-icon="mdi-keyboard"
        @click:append-inner="onFormReset"
        @click:append="onCancel"
        @update:model-value="onEmitForm"
        hide-details
      ></v-autocomplete>
    </div>

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
