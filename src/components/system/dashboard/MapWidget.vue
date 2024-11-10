<script setup>
import leaflet from 'leaflet'
import { onMounted, ref, watchEffect } from 'vue'
import { useGeolocation } from '@vueuse/core'

// Utilize pre-defined vue functions; GeoLocation
const { coords, locatedAt, resume, pause } = useGeolocation({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
})

// Load Variables
let map
let marker
const defaultLatLng = [8.95555279469484, 125.59780764933492] // CSU Coords
const isTrackingPause = ref(false)

// Toggle Geolocation Tracking
const onTrackingPause = () => {
  isTrackingPause.value = !isTrackingPause.value

  // Pause Tracking
  if (isTrackingPause.value) {
    pause()
    map.setView(defaultLatLng, 15)
  }
  // Resume Tracking
  else {
    resume()
    setMapMarker()
  }
}

// Set Map Marker Function
const setMapMarker = () => {
  const newLatLng = [coords.value.latitude, coords.value.longitude]

  // Update map view and marker position
  map.setView(newLatLng, 17)

  // If the marker is not on the map, add it
  if (!marker._map) marker.addTo(map)

  // Set the marker's position to the new coordinates
  marker.setLatLng(newLatLng).openPopup()
}

// Watch Coords variable if it changes
watchEffect(() => {
  if (
    coords.value.latitude !== Number.POSITIVE_INFINITY &&
    coords.value.longitude !== Number.POSITIVE_INFINITY
  )
    setMapMarker()
})

// Load Functions during component rendering
onMounted(() => {
  // Load Map, set view to default coords, Zoom = 15
  map = leaflet.map('map').setView(defaultLatLng, 15)

  // Load OpenStreetmap Map Layer
  leaflet
    .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    })
    .addTo(map)

  // Load Marker, set view to default coords
  marker = leaflet.marker(defaultLatLng).addTo(map).bindPopup('You are here!')
})
</script>

<template>
  <v-card title="Current Location">
    <template #subtitle>
      <div class="text-wrap">
        {{ `LatLng: ${coords.latitude}, ${coords.longitude}` }} <br />
        {{ `Date/Time: ${new Date(locatedAt).toLocaleString()}` }}
      </div>
    </template>

    <template #append>
      <v-btn @click="onTrackingPause" variant="text" icon>
        <v-icon :icon="isTrackingPause ? 'mdi-refresh' : 'mdi-pause'"></v-icon>

        <v-tooltip activator="parent" location="top">
          {{ isTrackingPause ? 'Resume Tracking' : 'Pause Tracking' }}
        </v-tooltip>
      </v-btn>
    </template>

    <v-card-text>
      <div id="map"></div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
#map {
  width: 100%;
  height: 225px;
}
</style>
