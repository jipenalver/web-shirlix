<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import SideNavigation from '@/components/layout/SideNavigation.vue'
import { ref } from 'vue'

const isDrawerVisible = ref(true)

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
  <AppLayout
    :is-with-app-bar-nav-icon="true"
    @is-drawer-visible="isDrawerVisible = !isDrawerVisible"
  >
    <template #navigation>
      <SideNavigation :is-drawer-visible="isDrawerVisible"></SideNavigation>
    </template>

    <template #content>
      <v-container>
        <v-card class="mb-5">
          <template #title>
            <span class="text-h6 font-weight-bold">
              <v-breadcrumbs :items="['System', 'Dashboard']"></v-breadcrumbs>
            </span>
          </template>
        </v-card>

        <v-row>
          <v-col cols="12" lg="6">
            <v-card title="Sample Line Graph">
              <v-card-text>
                <apexchart width="100%" type="line" :options="options" :series="series"></apexchart>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
