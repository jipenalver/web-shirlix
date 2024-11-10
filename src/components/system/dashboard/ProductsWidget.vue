<script setup>
import { useBranchesStore } from '@/stores/branches'
import { ref, onMounted } from 'vue'

// Use Pinia Store
const branchesStore = useBranchesStore()

// Chart Options
const options = {
  chart: {
    height: 350,
    type: 'bar'
  },
  colors: ['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800'],
  plotOptions: {
    bar: {
      columnWidth: '45%',
      distributed: true
    }
  },
  dataLabels: {
    enabled: true
  },
  legend: {
    show: true
  },
  xaxis: {
    type: 'category',
    categories: [
      ['John', 'Doe'],
      ['Joe', 'Smith'],
      ['Jake', 'Williams'],
      'Amber',
      ['Peter', 'Brown'],
      ['Mary', 'Evans'],
      ['David', 'Wilson'],
      ['Lily', 'Roberts']
    ],
    labels: {
      style: {
        colors: ['#36454F'],
        fontSize: '12px',
        fontWeight: 'bold'
      }
    },
    title: {
      text: 'Products'
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: ['#36454F'],
        fontSize: '14px',
        fontWeight: 'bold'
      }
    },
    title: {
      text: 'Quantity'
    }
  }
}

// Charts Series of Qtys
const series = [
  {
    name: 'Quantity',
    data: [21, 22, 10, 28, 16, 21, 13, 30]
  }
]

const chartFilters = ref({
  branch_id: null
})

// Retrieve Data based on Filter
const onFilterItems = () => {}

// Load Functions during component rendering
onMounted(async () => {
  if (branchesStore.branches.length == 0) await branchesStore.getBranches()
})
</script>

<template>
  <v-card title="Product Inventory Level" subtitle="Quantity per product" theme="light">
    <template #append>
      <v-autocomplete
        width="200px"
        v-model="chartFilters.branch_id"
        :items="branchesStore.branches"
        density="compact"
        label="Branch"
        item-title="name"
        item-value="id"
        variant="outlined"
        clearable
        @update:model-value="onFilterItems"
      ></v-autocomplete>
    </template>

    <v-card-text>
      <apexchart width="100%" type="bar" :options="options" :series="series"></apexchart>
    </v-card-text>
  </v-card>
</template>
