import { formActionDefault } from '@/utils/supabase'
import { useBranchesStore } from '@/stores/branches'
import { useProductsStore } from '@/stores/products'
import { useStockInStore } from '@/stores/stockIn'
import { onMounted, ref } from 'vue'
import { useDate } from 'vuetify'

// by convention, composable function names start with "use"
export function useStockInTable() {
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
  const isFormDialogVisible = ref(false)
  const isCodeFormDialogVisible = ref(false)
  const isConfirmDeleteDialog = ref(false)
  const itemData = ref(null)
  const deleteId = ref('')
  const formAction = ref({ ...formActionDefault })
  const action = ref('')

  // Verified Code
  const onCodeVerified = (isVerified) => {
    if (action.value === 'update') isFormDialogVisible.value = isVerified
    if (action.value === 'delete') isConfirmDeleteDialog.value = isVerified
  }

  // Trigger Update Btn
  const onUpdate = (item) => {
    itemData.value = item
    isCodeFormDialogVisible.value = true
    action.value = 'update'
  }

  // Trigger Add Btn
  const onAdd = () => {
    itemData.value = null
    isFormDialogVisible.value = true
  }

  // Trigger Delete Btn
  const onDelete = (id) => {
    deleteId.value = id
    isCodeFormDialogVisible.value = true
    action.value = 'delete'
  }

  // Confirm Delete
  const onConfirmDelete = async () => {
    // Reset Form Action utils
    formAction.value = { ...formActionDefault, formProcess: true }

    const { error } = await stockInStore.deleteStockIn(deleteId.value)

    // Turn off processing
    formAction.value.formProcess = false

    if (error) {
      // Add Error Message and Status Code
      formAction.value.formErrorMessage = error.message
      formAction.value.formStatus = error.status

      return
    }

    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Deleted Stock.'

    // Retrieve Data
    onLoadItems(tableOptions.value, tableFilters.value)
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
    isCodeFormDialogVisible,
    isFormDialogVisible,
    isConfirmDeleteDialog,
    itemData,
    formAction,
    onCodeVerified,
    onAdd,
    onUpdate,
    onDelete,
    onConfirmDelete,
    onFilterDate,
    onFilterItems,
    onSearchItems,
    onLoadItems,
    productsStore,
    branchesStore,
    stockInStore
  }
}
