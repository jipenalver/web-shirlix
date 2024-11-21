<script setup>
import NotAcceptableUI from '@/components/errors/NotAcceptableUI.vue'
import { useBranchesStore } from '@/stores/branches'
import { ref, onMounted, watch } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps(['theme'])

// Use Pinia Store
const branchesStore = useBranchesStore()

// Utilize pre-defined vue functions
const { xs } = useDisplay()

// Load Variables
const chartFilters = ref({
  branch_id: null
})
const themeVal = ref('')

// Monitor theme if it has data
watch(
  () => props.theme,
  () => {
    themeVal.value = props.theme
  }
)

// Bar Chart Options
const barOptions = {
  chart: {
    height: 350,
    type: 'bar',
    toolbar: {
      show: false
    }
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
    show: true,
    labels: {
      colors: '#C62828'
    }
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
        colors: '#C62828',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    },
    title: {
      text: 'Products',
      style: {
        color: '#C62828'
      }
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: '#C62828',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    },
    title: {
      text: 'Quantity',
      style: {
        color: '#C62828'
      }
    }
  },
  theme: {
    mode: themeVal.value
  },
  tooltip: {
    theme: themeVal.value
  }
}

// Charts Series of Qtys
const series = [
  {
    name: 'Quantity',
    data: [21, 22, 10, 28, 16, 21, 13, 30]
  }
]

// Retrieve Data based on Filter
const onFilterItems = () => {}

// Load Functions during component rendering
onMounted(async () => {
  if (branchesStore.branches.length == 0) await branchesStore.getBranches()
})
</script>

<template>
  <v-card v-if="xs" title="Product Inventory Level" subtitle="Quantity per product">
    <v-card-text class="mb-8">
      <NotAcceptableUI :is-show-back-btn="false"></NotAcceptableUI>
    </v-card-text>
  </v-card>

  <v-card v-else title="Product Inventory Level" subtitle="Quantity per product">
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
      <apexchart type="bar" width="100%" :options="barOptions" :series="series"></apexchart>
    </v-card-text>
  </v-card>
</template>
