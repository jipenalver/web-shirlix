<script setup>
const props = defineProps(['isDialogVisible', 'title', 'text'])

const emit = defineEmits(['update:isDialogVisible', 'confirm'])

const onConfirm = () => {
  emit('update:isDialogVisible', false)
  emit('confirm')
}

const onClose = () => {
  emit('update:isDialogVisible', false)
}
</script>

<template>
  <v-dialog max-width="400" :model-value="props.isDialogVisible" @update:model-value="onClose">
    <v-card prepend-icon="mdi-map-marker" :title="props.title">
      <v-card-text>
        {{ props.text }}
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn prepend-icon="mdi-thumb-down" @click="onClose"> Disagree </v-btn>

        <v-btn
          prepend-icon="mdi-thumb-up"
          color="deep-orange-lighten-1"
          variant="elevated"
          @click="onConfirm"
        >
          Agree
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
