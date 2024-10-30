<script setup>
const options = {
  chart: {
    id: 'vuechart-example'
  },
  xaxis: {
    categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
  }
}

const series = [
  {
    name: 'series-1',
    data: [30, 40, 45, 50, 49, 60, 70, 91]
  }
]
</script>

<template>
  <v-card title="Sales Per Day">
    <v-card-text>
      <apexchart width="100%" type="line" :options="options" :series="series"></apexchart>
    </v-card-text>
  </v-card>
</template>
