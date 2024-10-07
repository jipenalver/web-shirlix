<script setup>
import { supabase, formActionDefault } from '@/utils/supabase'
import { useDisplay } from 'vuetify'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps(['isDrawerVisible'])

const router = useRouter()
const { mobile } = useDisplay()

const isDrawerVisible = ref(props.isDrawerVisible)
const userData = ref({
  email: '',
  fullname: ''
})
const formAction = ref({
  ...formActionDefault
})

watch(props, () => {
  isDrawerVisible.value = props.isDrawerVisible
})

const userManagementNav = [
  ['User Roles', 'mdi-tag-multiple'],
  ['Users Management', 'mdi-account-multiple']
]

const individualNav = [
  ['Individual Performance Accomplishment', 'mdi-list-box', 'Accomplishment Report Form']
]

const officeNav = [
  ['Office Performance Accomplishment', 'mdi-list-box', 'Accomplishment Report Form']
]

const divisionNav = [
  ['Division Performance Accomplishment', 'mdi-list-box', 'Accomplishment Report Form']
]

const reportNav = [
  ['Individual Performance', 'mdi-account', 'Contract & Rating'],
  ['Office Performance', 'mdi-office-building', 'Contract & Rating'],
  ['Division Performance', 'mdi-domain', 'Contract & Rating']
]

const onLogout = async () => {
  formAction.value = { ...formActionDefault }
  formAction.value.formProcess = true

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error during logout:', error)
    return
  }

  formAction.value.formProcess = false
  router.replace('/')
}

const getUser = async () => {
  const {
    data: {
      user: { user_metadata: metadata }
    }
  } = await supabase.auth.getUser()

  userData.value.email = metadata.email
  userData.value.fullname = metadata.lastname + ', ' + metadata.firstname
}

onMounted(() => {
  getUser()
})
</script>

<template>
  <v-navigation-drawer
    v-model="isDrawerVisible"
    :temporary="mobile"
    :permanent="!mobile"
    width="350"
  >
    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
        value="Dashboard"
      ></v-list-item>

      <v-divider></v-divider>

      <v-list-group value="User Management">
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-account-wrench"
            title="User Management"
          ></v-list-item>
        </template>

        <v-list-item
          v-for="([title, icon], i) in userManagementNav"
          :key="i"
          :prepend-icon="icon"
          :title="title"
          :value="title"
        ></v-list-item>
      </v-list-group>

      <v-list-group value="Individual Level">
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-account"
            title="Individual Level"
          ></v-list-item>
        </template>

        <v-list-item
          v-for="([title, icon, subtitle], i) in individualNav"
          :key="i"
          :prepend-icon="icon"
          :title="title"
          :value="title"
          :subtitle="subtitle"
        ></v-list-item>
      </v-list-group>

      <v-list-group value="Office Level">
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-office-building"
            title="Office Level"
          ></v-list-item>
        </template>

        <v-list-item
          v-for="([title, icon, subtitle], i) in officeNav"
          :key="i"
          :prepend-icon="icon"
          :title="title"
          :value="title"
          :subtitle="subtitle"
        ></v-list-item>
      </v-list-group>

      <v-list-group value="Division Level">
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-domain"
            title="Division Level"
          ></v-list-item>
        </template>

        <v-list-item
          v-for="([title, icon, subtitle], i) in divisionNav"
          :key="i"
          :prepend-icon="icon"
          :title="title"
          :value="title"
          :subtitle="subtitle"
        ></v-list-item>
      </v-list-group>

      <v-divider></v-divider>

      <v-list-group value="Reports">
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-file-delimited"
            title="Reports"
          ></v-list-item>
        </template>

        <v-list-item
          v-for="([title, icon, subtitle], i) in reportNav"
          :key="i"
          :prepend-icon="icon"
          :title="title"
          :value="title"
          :subtitle="subtitle"
        ></v-list-item>
      </v-list-group>

      <v-list-item
        prepend-icon="mdi-wrench"
        title="Account Settings"
        value="Account Settings"
      ></v-list-item>
    </v-list>

    <template #append>
      <v-card prepend-icon="mdi-account-circle" :subtitle="userData.email" variant="tonal">
        <template #title>
          <span class="font-weight-bold text-h6">{{ userData.fullname }}</span>
        </template>
      </v-card>

      <div class="pa-2">
        <v-btn
          color="deep-orange-lighten-1"
          prepend-icon="mdi-logout"
          @click="onLogout"
          :loading="formAction.formProcess"
          :disabled="formAction.formProcess"
          block
        >
          Logout
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>
