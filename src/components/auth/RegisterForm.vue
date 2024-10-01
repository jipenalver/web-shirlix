<template>
  <v-form fast-fail @submit.prevent>
    <v-text-field label="Firstname" variant="outlined"></v-text-field>

    <v-text-field label="Lastname" variant="outlined"></v-text-field>

    <v-text-field label="Email" variant="outlined"></v-text-field>

    <v-text-field label="Password" type="password" variant="outlined"></v-text-field>

    <v-text-field label="Password Confirmation" type="password" variant="outlined"></v-text-field>

    <v-btn
      class="mt-2"
      type="submit"
      block
      color="deep-orange-lighten-1"
      prepend-icon="mdi-account-plus"
    >
      Register
    </v-btn>
  </v-form>
</template>
