<script setup>
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps(['isWithAppBarNavIcon'])

const emit = defineEmits(['isDrawerVisible'])

const { mobile } = useDisplay()
const theme = ref(localStorage.getItem('theme') ?? 'light')

function onClick() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
}
</script>

<template>
  <v-responsive>
    <v-app :theme="theme">
      <v-app-bar
        class="px-3"
        :color="theme === 'light' ? 'grey-lighten-1' : 'grey-darken-4'"
        border
      >
        <v-app-bar-nav-icon
          v-if="props.isWithAppBarNavIcon"
          icon="mdi-menu"
          :theme="theme"
          @click="emit('isDrawerVisible')"
        >
        </v-app-bar-nav-icon>

        <v-spacer></v-spacer>

        <v-btn
          :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="elevated"
          color="deep-orange-lighten-1"
          slim
          @click="onClick"
        ></v-btn>
      </v-app-bar>

      <slot name="navigation"></slot>

      <v-main>
        <slot name="content"></slot>
      </v-main>

      <v-footer
        class="font-weight-bold"
        :class="mobile ? 'text-caption' : ''"
        :color="theme === 'light' ? 'grey-lighten-1' : 'grey-darken-4'"
        border
        app
      >
        <div :class="mobile ? 'w-100 text-center' : ''">
          Copyright © 2024 - Shirlix Meatshop | All Rights Reserved
        </div>
      </v-footer>
    </v-app>
  </v-responsive>
</template>
