import {
  getPadLeftText,
  generateCSV,
  generateCSVTrim,
  getAccumulatedNumber,
  getPreciseNumber
} from '@/utils/helpers'
import { tableHeaders } from '@/components/system/reports/stocksReportTableUtils'
import { useBranchesStore } from '@/stores/branches'
import { useProductsStore } from '@/stores/products'
import { useReportsStore } from '@/stores/reports'
import { onMounted, onUnmounted, ref } from 'vue'
import { useDate } from 'vuetify'

// by convention, composable function names start with "use"
export function useStocksReport() {
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
    search: '',
    branch_id: null,
    product_id: null,
    purchased_at: null
  })
  const isTransferFormDialogVisible = ref(false)
  const itemData = ref(null)

  // Calculate Sold Qty
  const getSoldQty = (item) => {
    return getAccumulatedNumber(item.sale_products, 'qty') + ' ' + item.qty_metric
  }

  // Calculate Stock In Qty
  const getStockInQty = (item) => {
    return item.qty_reweighed
      ? item.qty_reweighed + ' ' + item.qty_metric
      : item.qty + ' ' + item.qty_metric
  }

  // Calculate Stock Remaining
  const getStockRemaining = (item) => {
    return getPreciseNumber(item.qty_reweighed - getAccumulatedNumber(item.sale_products, 'qty'))
  }

  // Trigger Transfer Btn
  const onTransfer = (item) => {
    itemData.value = { ...item, stock_remaining: getStockRemaining(item) }
    isTransferFormDialogVisible.value = true
  }

  // Retrieve Data based on Date
  const onFilterDate = (isCleared = false) => {
    if (isCleared) tableFilters.value.purchased_at = null

    onLoadItems(tableOptions.value, tableFilters.value)
  }

  // Retrieve Data based on Filter
  const onFilterItems = () => {
    onLoadItems(tableOptions.value, tableFilters.value)
  }

  // Retrieve Data based on Search
  const onSearchItems = () => {
    if (
      tableFilters.value.search?.length >= 4 ||
      tableFilters.value.search?.length == 0 ||
      tableFilters.value.search === null
    )
      onLoadItems(tableOptions.value, tableFilters.value)
  }

  // Load Tables Data
  const onLoadItems = async ({ page, itemsPerPage, sortBy }) => {
    // Trigger Loading
    tableOptions.value.isLoading = true

    await reportsStore.getStocksReport({ page, itemsPerPage, sortBy }, tableFilters.value)

    // Trigger Loading
    tableOptions.value.isLoading = false
  }

  // CSV Data
  const csvData = () => {
    // Get the headers from utils
    const headers = tableHeaders.slice(0, -1).map((header) => header.title)
    const addHeaders = [
      'Unit Price',
      'Added Date',
      'Purchased Date',
      'Supplier',
      'Branch',
      'Remarks'
    ]
    const newHeaders = [...headers, ...addHeaders].join(',')

    // Get the reports data and map it to be used as csv data, follow the headers arrangement
    const rows = reportsStore.stocksReport.map((item) => {
      return [
        "'" + getPadLeftText(item.id),
        generateCSVTrim(item.products.name),
        getStockInQty(item),
        item.sale_products.length === 0 ? '-' : getSoldQty(item),
        item.is_portion ? getStockRemaining(item) + ' ' + item.qty_metric : getStockInQty(item),
        item.expired_at ? generateCSVTrim(date.format(item.expired_at, 'fullDate')) : 'n/a',
        item.is_portion ? (getStockRemaining(item) > 0 ? 'In Stock' : 'Out of Stock') : 'Inventory',

        item.unit_price,
        generateCSVTrim(date.format(item.created_at, 'fullDateTime')),
        generateCSVTrim(date.format(item.purchased_at, 'fullDate')),
        generateCSVTrim(item.supplier),
        generateCSVTrim(item.branches.name),
        generateCSVTrim(item.remarks)
      ].join(',')
    })

    // Combine headers and csv data
    return [newHeaders, ...rows].join('\n')
  }

  // Generate CSV
  const onGenerate = () => {
    const filename = new Date().toISOString() + '-stocks-report'

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
    itemData,
    isTransferFormDialogVisible,
    getSoldQty,
    getStockInQty,
    getStockRemaining,
    onTransfer,
    onFilterDate,
    onFilterItems,
    onSearchItems,
    onGenerate,
    onLoadItems,
    productsStore,
    branchesStore,
    reportsStore
  }
}
