import { getAccumulatedNumber, getPreciseNumber } from '@/utils/helpers'
import { useBranchesStore } from '@/stores/branches'
import { useProductsStore } from '@/stores/products'
import { formActionDefault } from '@/utils/supabase'
import { useStockInStore } from '@/stores/stockIn'
import { onMounted, ref } from 'vue'
import { useDate } from 'vuetify'

// by convention, composable function names start with "use"
export function useStockTransferTable() {
  // Utilize pre-defined vue functions
  const date = useDate()

  // Use Pinia Store
  const productsStore = useProductsStore()
  const branchesStore = useBranchesStore()
  const stockInStore = useStockInStore()

  // Load Variables
  const tableOptions = ref({
    page: 1,
    itemsPerPage: 10,
    sortBy: [],
    isLoading: false,
    isNotSegregated: true
  })
  const tableFilters = ref({
    search: '',
    branch_id: null,
    product_id: null,
    purchased_at: [new Date(date.format(new Date(), 'fullDate'))]
  })
  const isTransferFormDialogVisible = ref(false)
  const itemData = ref(null)
  const formAction = ref({ ...formActionDefault })

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

  // Trigger Update Btn
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

    await stockInStore.getStockInTable(
      { page, itemsPerPage, sortBy, isNotSegregated: true },
      tableFilters.value
    )

    // Trigger Loading
    tableOptions.value.isLoading = false
  }

  // Load Functions during component rendering
  onMounted(async () => {
    if (branchesStore.branches.length == 0) await branchesStore.getBranches()
    if (productsStore.products.length == 0) await productsStore.getProducts()
  })

  // expose managed state as return value
  return {
    date,
    tableOptions,
    tableFilters,
    isTransferFormDialogVisible,
    itemData,
    formAction,
    getStockInQty,
    getStockRemaining,
    onTransfer,
    onFilterDate,
    onFilterItems,
    onSearchItems,
    onLoadItems,
    productsStore,
    branchesStore,
    stockInStore
  }
}
