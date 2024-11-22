<script setup>
const props = defineProps(['isShowBackBtn'])
</script>

<template>
  <v-row>
    <v-col class="mx-auto text-center" cols="12" lg="4">
      <h1 class="text-h1 font-weight-black text-red-darken-4">406</h1>
      <h2 class="text-h3 font-weight-black mb-2">Not Acceptable</h2>

      <p class="text-subtitle-1 font-weight-bold mb-4">
        The UI is not available for mobile devices. Please switch to a tablet or desktop.
      </p>

      <v-btn
        v-if="props.isShowBackBtn"
        class="mt-2"
        color="red-darken-4"
        prepend-icon="mdi-home"
        to="/"
      >
        Back to Dashboard
      </v-btn>
    </v-col>
  </v-row>
</template>
