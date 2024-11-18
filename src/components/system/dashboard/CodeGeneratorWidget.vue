<script setup>
import { requiredValidator } from '@/utils/validators'
import { formActionDefault } from '@/utils/supabase.js'
import { useCodesStore } from '@/stores/codes'
import { useDate } from 'vuetify'
import { ref } from 'vue'

// Utilize pre-defined vue functions
const date = useDate()

// Use Pinia Store
const codesStore = useCodesStore()

// Load Variables
const tableHeaders = [
  {
    title: 'Code',
    key: 'code',
    align: 'start'
  },
  {
    title: 'Date Generated',
    key: 'created_at',
    align: 'end'
  }
]
const tableOptions = ref({
  page: 1,
  itemsPerPage: -1,
  sortBy: [],
  isLoading: false
})
const formDataDefault = {
  qty: 1
}
const formData = ref({ ...formDataDefault })
const formAction = ref({ ...formActionDefault })
const refVForm = ref()
const isCopied = ref({})

// Copy Functionality
const onCopyCode = async (code) => {
  await navigator.clipboard.writeText(code)
  isCopied.value[code] = true

  setTimeout(() => {
    isCopied.value[code] = false
  }, 3000)
}

// Submit Functionality
const onSubmit = async () => {
  // Reset Form Action utils
  formAction.value = { ...formActionDefault, formProcess: true }

  //  Do add
  const { data, error } = await codesStore.addCode(formData.value)

  if (error) {
    // Add Error Message and Status Code
    formAction.value.formErrorMessage = error.message
    formAction.value.formStatus = error.status

    // Turn off processing
    formAction.value.formProcess = false
  } else if (data) {
    await codesStore.getCodes(tableOptions.value)

    // Reset Form
    refVForm.value?.reset()
    // Turn off processing
    formAction.value.formProcess = false
  }
}

// Trigger Validators
const onFormSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}

// Load Tables Data
const onLoadItems = async ({ page, itemsPerPage, sortBy }) => {
  // Trigger Loading
  tableOptions.value.isLoading = true

  await codesStore.getCodes({ page, itemsPerPage, sortBy })

  // Trigger Loading
  tableOptions.value.isLoading = false
}
</script>

<template>
  <v-card title="Code Generator" subtitle="Generate Approval Codes" height="370px">
    <!-- eslint-disable vue/valid-v-slot -->
    <v-data-table-server
      v-model:items-per-page="tableOptions.itemsPerPage"
      v-model:page="tableOptions.page"
      v-model:sort-by="tableOptions.sortBy"
      :loading="tableOptions.isLoading"
      :headers="tableHeaders"
      :items="codesStore.codes"
      :items-length="codesStore.codes.length"
      @update:options="onLoadItems"
      no-data-text="No code available"
      height="230px"
      hide-default-footer
    >
      <template #top>
        <v-form ref="refVForm" @submit.prevent="onFormSubmit">
          <v-row class="mx-1" dense>
            <v-spacer></v-spacer>

            <v-col cols="4" sm="4">
              <v-text-field
                v-model="formData.qty"
                density="compact"
                placeholder="Quantity"
                type="number"
                variant="outlined"
                min="1"
                :rules="[requiredValidator]"
              ></v-text-field>
            </v-col>

            <v-col cols="3" sm="2" class="d-flex justify-center">
              <v-btn
                class="my-1"
                color="red-darken-4"
                type="submit"
                :disabled="formAction.formProcess"
                :loading="formAction.formProcess"
                block
              >
                <v-icon icon="mdi-shield-refresh"></v-icon>

                <v-tooltip activator="parent" location="top"> Generate Code </v-tooltip>
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </template>

      <template #item.code="{ item }">
        <span class="font-weight-bold">
          {{ item.code }}

          <v-btn variant="text" density="compact" @click="onCopyCode(item.code)" icon>
            <v-icon
              :icon="isCopied[item.code] ? 'mdi-clipboard-check' : 'mdi-content-copy'"
              size="x-small"
            ></v-icon>
            <v-tooltip activator="parent" location="top">
              {{ isCopied[item.code] ? 'Copied Code' : 'Copy Code' }}
            </v-tooltip>
          </v-btn>
        </span>
      </template>

      <template #item.created_at="{ item }">
        <span class="font-weight-bold">
          {{ item.created_at ? date.format(item.created_at, 'fullDateTime') : '' }}
        </span>
      </template>
    </v-data-table-server>
  </v-card>
</template>
