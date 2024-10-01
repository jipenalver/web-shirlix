<template>
  <v-form fast-fail @submit.prevent>
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field label="Firstname"></v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field label="Lastname"></v-text-field>
      </v-col>

      <v-col cols="12">
        <v-text-field label="Email"></v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field label="Password" type="password"></v-text-field>
      </v-col>

      <v-col cols="12" md="6">
        <v-text-field label="Password Confirmation" type="password"></v-text-field>
      </v-col>
    </v-row>

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
