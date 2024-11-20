<script setup></script>

<template>
  <v-row dense>
    <v-col cols="12">
      <v-card>
        <v-card-text>
          <v-text-field
            density="compact"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search Products"
            clearable
          ></v-text-field>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="4" md="3">
      <v-card>
        <v-img height="150" cover></v-img>

        <v-card-subtitle class="text-center"> 1,000 miles of wonder </v-card-subtitle>

        <v-card-title class="text-center"> Top western road trips </v-card-title>

        <v-card-text> </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
