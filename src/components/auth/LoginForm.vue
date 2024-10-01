<template>
  <v-form fast-fail @submit.prevent>
    <v-text-field label="Email"></v-text-field>

    <v-text-field label="Password" type="password"></v-text-field>

    <v-btn class="mt-2" type="submit" block color="deep-orange-lighten-1" prepend-icon="mdi-login">
      Login
    </v-btn>
  </v-form>
</template>
