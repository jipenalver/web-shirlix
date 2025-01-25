import { getAccumulatedNumber, getPreciseNumber } from '@/utils/helpers'
import { useAuthUserStore } from '@/stores/authUser'
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
  const authStore = useAuthUserStore()
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
  const isCodeFormDialogVisible = ref(false)
  const isConfirmApproveDialog = ref(false)
  const isConfirmDisapproveDialog = ref(false)
  const itemData = ref(null)
  const disapproveId = ref('')
  const formAction = ref({ ...formActionDefault })
  const action = ref('')

  // Calculate Stock In Qty
  const getStockInQty = (item) => {
    return item.qty_reweighed ?? item.qty
  }

  // Calculate Stock Remaining
  const getStockRemaining = (item) => {
    return getPreciseNumber(item.qty_reweighed - getAccumulatedNumber(item.sale_products, 'qty'))
  }

  // Verified Code
  const onCodeVerified = (isVerified) => {
    if (action.value === 'approve') isConfirmApproveDialog.value = isVerified
    if (action.value === 'disapprove') isConfirmDisapproveDialog.value = isVerified
  }

  // Trigger Approve Btn
  const onApprove = (item) => {
    itemData.value = item
    action.value = 'approve'
    if (authStore.userRole === 'Super Administrator') isConfirmApproveDialog.value = true
    else isCodeFormDialogVisible.value = true
  }

  // Trigger Disapprove Btn
  const onDisapprove = (id) => {
    disapproveId.value = id
    action.value = 'disapprove'
    if (authStore.userRole === 'Super Administrator') isConfirmDisapproveDialog.value = true
    else isCodeFormDialogVisible.value = true
  }

  // Trigger Confirm Approve Btn
  const onConfirmApprove = async () => {
    // Reset Form Action utils
    formAction.value = { ...formActionDefault, formProcess: true }

    // Turn off processing
    formAction.value.formProcess = false

    const { error } = await stockInStore.approveStockTransfer(itemData.value)

    if (error) {
      // Add Error Message and Status Code
      formAction.value.formErrorMessage = error.message
      formAction.value.formStatus = error.status
      return
    }

    // Add Success Message
    formAction.value.formSuccessMessage = 'Approved Transfer Request.'
    // Retrieve Data
    onLoadItems(tableOptions.value, tableFilters.value)
  }

  // Trigger Confirm Disapprove Btn
  const onConfirmDisapprove = async () => {
    // Reset Form Action utils
    formAction.value = { ...formActionDefault, formProcess: true }

    const { error } = await stockInStore.disapproveStockTransfer(disapproveId.value)

    // Turn off processing
    formAction.value.formProcess = false

    if (error) {
      // Add Error Message and Status Code
      formAction.value.formErrorMessage = error.message
      formAction.value.formStatus = error.status
      return
    }

    // Add Success Message
    formAction.value.formSuccessMessage = 'Disapproved Transfer Request.'
    // Retrieve Data
    onLoadItems(tableOptions.value, tableFilters.value)
  }

  // Trigger Update Btn
  const onTransfer = (item) => {
    itemData.value = {
      ...item,
      stock_remaining: item.is_portion ? getStockRemaining(item) : getStockInQty(item)
    }
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
      tableFilters.value.search?.length >= 2 ||
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
    isCodeFormDialogVisible,
    isConfirmApproveDialog,
    isConfirmDisapproveDialog,
    itemData,
    formAction,
    getStockInQty,
    getStockRemaining,
    onCodeVerified,
    onApprove,
    onDisapprove,
    onConfirmApprove,
    onConfirmDisapprove,
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
