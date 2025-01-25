import { tableHeaders } from '@/components/system/reports/productsReportTableUtils'
import { generateCSV, generateCSVTrim } from '@/utils/helpers'
import { useBranchesStore } from '@/stores/branches'
import { useProductsStore } from '@/stores/products'
import { useReportsStore } from '@/stores/reports'
import { onMounted, onUnmounted, ref } from 'vue'
import { useDate } from 'vuetify'

// by convention, composable function names start with "use"
export function useProductsReportTable() {
  // Utilize pre-defined vue functions
  const date = useDate()

  // Use Pinia Store
  const productsStore = useProductsStore()
  const branchesStore = useBranchesStore()
  const reportsStore = useReportsStore()

  // Load Variables
  const tableOptions = ref({
    page: 1,
    itemsPerPage: -1,
    sortBy: [],
    isLoading: false
  })
  const tableFilters = ref({
    branch_id: null,
    product_id: null,
    date: null
  })

  // Retrieve Data based on Date
  const onFilterDate = (isCleared = false) => {
    if (isCleared) tableFilters.value.date = null

    onLoadItems(tableOptions.value, tableFilters.value)
  }

  // Retrieve Data based on Filter
  const onFilterItems = () => {
    onLoadItems(tableOptions.value, tableFilters.value)
  }

  // Load Tables Data
  const onLoadItems = async ({ page, itemsPerPage, sortBy }) => {
    // Trigger Loading
    tableOptions.value.isLoading = true

    await reportsStore.getProductsReport({ page, itemsPerPage, sortBy }, tableFilters.value)

    // Trigger Loading
    tableOptions.value.isLoading = false
  }

  // CSV Data
  const csvData = () => {
    // Get the headers from utils
    const headers = tableHeaders.map((header) => header.title)
    const addHeaders = ['Metric']
    const newHeaders = [...headers, ...addHeaders].join(',')

    // Get the reports data and map it to be used as csv data, follow the headers arrangement
    const rows = reportsStore.productsReport.map((item) => {
      // eslint-disable-next-line no-unused-vars
      const { date: createdDate, name, image_url, description, ...data } = item

      const arrayData = Object.values(data)

      return [
        generateCSVTrim(date.format(createdDate, 'fullDate')),
        generateCSVTrim(name),
        ...arrayData
      ].join(',')
    })

    // Combine headers and csv data
    return [newHeaders, ...rows].join('\n')
  }

  // Generate CSV
  const onGenerate = () => {
    const filename = new Date().toISOString() + '-products-inventory-report'

    generateCSV(filename, csvData())
  }

  // If Component is Unloaded
  onUnmounted(() => {
    reportsStore.$reset()
  })

  // Load Functions during component rendering
  onMounted(async () => {
    if (branchesStore.branches.length == 0) await branchesStore.getBranches()
    if (productsStore.products.length == 0) await productsStore.getProducts()
  })

  // expose managed state as return value
  return {
    date,
    tableHeaders,
    tableOptions,
    tableFilters,
    onFilterDate,
    onFilterItems,
    onLoadItems,
    onGenerate,
    productsStore,
    branchesStore,
    reportsStore
  }
}
