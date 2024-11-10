<script setup>
const props = defineProps(['formSuccessMessage', 'formErrorMessage'])
</script>

<template>
  <div :class="props.formSuccessMessage || props.formErrorMessage ? 'mb-5' : ''">
    <v-alert
      v-if="props.formSuccessMessage"
      :text="props.formSuccessMessage"
      title="Success!"
      type="success"
      variant="tonal"
      density="compact"
      border="start"
      closable
    ></v-alert>
    <v-alert
      v-if="props.formErrorMessage"
      :text="props.formErrorMessage"
      title="Ooops!"
      type="error"
      variant="tonal"
      density="compact"
      border="start"
      closable
    ></v-alert>
  </div>
</template>
