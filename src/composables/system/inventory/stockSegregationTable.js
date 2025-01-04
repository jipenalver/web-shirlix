import { useBranchesStore } from '@/stores/branches'
import { useProductsStore } from '@/stores/products'
import { formActionDefault } from '@/utils/supabase'
import { useStockInStore } from '@/stores/stockIn'
import { onMounted, ref } from 'vue'
import { useDate } from 'vuetify'

// by convention, composable function names start with "use"
export function useStockSegregationTable() {
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
    isLoading: false
  })
  const tableFilters = ref({
    search: '',
    branch_id: null,
    product_id: null,
    purchased_at: [new Date(date.format(new Date(), 'fullDate'))]
  })
  const isWeightFormDialogVisible = ref(false)
  const isSegregateFormDialogVisible = ref(false)
  const isPriceFormDialogVisible = ref(false)
  const isCodeFormDialogVisible = ref(false)
  const itemData = ref(null)
  const formAction = ref({ ...formActionDefault })
  const action = ref('')

  // Verified Code
  const onCodeVerified = (isVerified) => {
    // if (action.value === 'weight') isWeightFormDialogVisible.value = isVerified
    // if (action.value === 'segregate') isSegregateFormDialogVisible.value = isVerified
    if (action.value === 'price') isPriceFormDialogVisible.value = isVerified
  }

  // Trigger Update Btn
  const onUpdateWeight = (item) => {
    itemData.value = item
    isWeightFormDialogVisible.value = true
    // isCodeFormDialogVisible.value = true
    // action.value = 'weight'
  }

  // Trigger Update Btn
  const onUpdateSegregate = (item) => {
    itemData.value = item
    isSegregateFormDialogVisible.value = true
    // isCodeFormDialogVisible.value = true
    // action.value = 'segregate'
  }

  // Trigger Update Btn
  const onUpdatePrice = (item) => {
    itemData.value = item
    isCodeFormDialogVisible.value = true
    action.value = 'price'
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

    await stockInStore.getStockInTable({ page, itemsPerPage, sortBy }, tableFilters.value)

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
    isWeightFormDialogVisible,
    isSegregateFormDialogVisible,
    isPriceFormDialogVisible,
    isCodeFormDialogVisible,
    itemData,
    formAction,
    onCodeVerified,
    onUpdateWeight,
    onUpdateSegregate,
    onUpdatePrice,
    onFilterDate,
    onFilterItems,
    onSearchItems,
    onLoadItems,
    productsStore,
    branchesStore,
    stockInStore
  }
}
