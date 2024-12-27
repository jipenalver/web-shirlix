import { onMounted, onUnmounted } from 'vue'

// by convention, composable function names start with "use"
export function useStocksReport() {
  // a composable can also hook into its owner component's
  // lifecycle to setup and teardown side effects.
  onMounted(() => {})
  onUnmounted(() => {})

  // expose managed state as return value
  return {}
}
