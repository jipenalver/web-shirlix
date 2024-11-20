<script setup>
import StocksList from '@/components/system/inventory/sales/StocksList.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import SideNavigation from '@/components/layout/navigation/SideNavigation.vue'
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

// Utilize pre-defined vue functions
const { mobile } = useDisplay()

// Load Variables
const isDrawerVisible = ref(mobile.value ? false : true)
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
      <v-container fluid>
        <v-row>
          <v-col cols="12" sm="8" class="bg-surface-light">
            <StocksList></StocksList>
          </v-col>

          <v-col cols="12" sm="4" class="position-relative h-screen">
            <v-row dense>
              <v-col cols="12" class="d-flex justify-end">
                <v-btn variant="text" density="compact" icon>
                  <v-icon icon="mdi-refresh"></v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-divider class="my-3"></v-divider>

            <v-list lines="one">
              <v-list-group value="Sample Product" color="error" fluid>
                <template #activator="{ props }">
                  <v-list-item v-bind="props" title="Sample Product" subtitle="tesads">
                    <template #prepend>
                      <h3 class="me-3">2</h3>
                    </template>

                    <template #append>
                      <div class="me-1">
                        <span class="text-body-2 font-weight-bold">Php 14 </span> <br />
                        <span class="text-caption">dsadsa</span>
                      </div>

                      <v-btn variant="text" density="compact" icon>
                        <v-icon icon="mdi-delete"></v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </template>

                <v-list-item>
                  <v-row dense>
                    <v-col cols="6">
                      <v-text-field
                        class="mt-2"
                        variant="outlined"
                        density="compact"
                        label="Quantity"
                        type="number"
                        min="1"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="6">
                      <v-text-field
                        class="mt-2"
                        variant="outlined"
                        density="compact"
                        label="Discount"
                        suffix="%"
                        type="number"
                        min="0"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-list-item>
              </v-list-group>
            </v-list>

            <v-row class="position-absolute bottom-0 left-0 right-0 pa-4" dense>
              <v-col cols="12" class="bg-primary w-100">
                <v-btn variant="text"> Add </v-btn>

                <v-btn variant="text"> Discount </v-btn>
              </v-col>

              <v-col cols="12">
                <ul class="ms-5">
                  <li>Subtotal</li>
                  <li>Tax</li>
                </ul>
                <h3>Payable Amount</h3>
              </v-col>

              <v-divider class="my-3"></v-divider>

              <v-col cols="12">
                <v-btn block>Proceed</v-btn>
              </v-col>

              <div style="height: 10rem"></div>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
