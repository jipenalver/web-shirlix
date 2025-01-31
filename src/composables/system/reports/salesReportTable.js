import {
  generateCSV,
  generateCSVTrim,
  getAccumulatedNumber,
  getPadLeftText,
  getPreciseNumber
} from '@/utils/helpers'
import { tableHeaders } from '@/components/system/reports/salesReportTableUtils'
import { formActionDefault } from '@/utils/supabase'
import { useBranchesStore } from '@/stores/branches'
import { useAuthUserStore } from '@/stores/authUser'
import { useReportsStore } from '@/stores/reports'
import { onMounted, onUnmounted, ref } from 'vue'
import { useSalesStore } from '@/stores/sales'
import { useDate } from 'vuetify'

// by convention, composable function names start with "use"
export function useSalesReportTable() {
  // Utilize pre-defined vue functions
  const date = useDate()

  // Use Pinia Store
  const authStore = useAuthUserStore()
  const branchesStore = useBranchesStore()
  const salesStore = useSalesStore()
  const reportsStore = useReportsStore()

  // Load Variables
  const tableOptions = ref({
    page: 1,
    itemsPerPage: -1,
    sortBy: [],
    isLoading: false
  })
  const tableFilters = ref({
    customer_id: null,
    branch_id: null,
    created_at: null
  })
  const itemData = ref(null)
  const isViewProductsDialog = ref(false)
  const isViewPaymentsDialog = ref(false)
  const isCodeFormDialogVisible = ref(false)
  const isConfirmDeleteDialog = ref(false)
  const deleteId = ref('')
  const formAction = ref({ ...formActionDefault })
  const action = ref('')

  // Calculate Discount
  const getDiscount = (item) => {
    return getPreciseNumber(item.exact_price - item.overall_price)
  }

  // Calculate Collectibles
  const getPaymentBalance = (item) => {
    return getPreciseNumber(
      item.overall_price - getAccumulatedNumber(item.customer_payments, 'payment')
    )
  }

  // Verified Code
  const onCodeVerified = (isVerified) => {
    if (action.value === 'delete') isConfirmDeleteDialog.value = isVerified
  }

  // View Products
  const onViewProducts = (item) => {
    itemData.value = item
    isViewProductsDialog.value = true
  }

  // View Payments
  const onViewPayments = (item) => {
    itemData.value = item
    isViewPaymentsDialog.value = true
  }

  // Trigger Delete Btn
  const onDelete = (id) => {
    deleteId.value = id
    action.value = 'delete'
    if (authStore.userRole === 'Super Administrator') isConfirmDeleteDialog.value = true
    else isCodeFormDialogVisible.value = true
  }

  // Confirm Delete
  const onConfirmDelete = async () => {
    // Reset Form Action utils
    formAction.value = { ...formActionDefault, formProcess: true }

    const { error } = await salesStore.deleteSales(deleteId.value)

    // Turn off processing
    formAction.value.formProcess = false

    if (error) {
      // Add Error Message and Status Code
      formAction.value.formErrorMessage = error.message
      formAction.value.formStatus = error.status
      return
    }

    // Add Success Message
    formAction.value.formSuccessMessage = 'Successfully Deleted Sales Information.'

    // Retrieve Data
    onLoadItems(tableOptions.value, tableFilters.value)
  }

  // Retrieve Data based on Date
  const onFilterDate = (isCleared = false) => {
    if (isCleared) tableFilters.value.created_at = null

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

    await reportsStore.getSalesReport({ page, itemsPerPage, sortBy }, tableFilters.value)

    // Trigger Loading
    tableOptions.value.isLoading = false
  }

  // CSV Data
  const csvData = () => {
    // Get the headers from utils
    const headers = tableHeaders.slice(0, -1).map((header) => header.title)
    const addHeaders = ['Branch', 'Customer']
    const newHeaders = [...headers, ...addHeaders].join(',')

    // Get the reports data and map it to be used as csv data, follow the headers arrangement
    const rows = reportsStore.salesReport.map((item) => {
      return [
        "'" + getPadLeftText(item.id),
        generateCSVTrim(date.format(item.created_at, 'fullDateTime')),
        item.exact_price,
        getDiscount(item) === 0 ? '-' : getDiscount(item),
        item.overall_price,
        item.customer_payments.length === 0 ? '-' : getPaymentBalance(item),
        item.customer_payments.length === 0 ? 'Fully Paid' : 'Partially Paid',
        generateCSVTrim(item.branches.name),
        generateCSVTrim(item.customers?.customer)
      ].join(',')
    })

    // Combine headers and csv data
    return [newHeaders, ...rows].join('\n')
  }

  // Generate CSV
  const onGenerate = () => {
    const filename = new Date().toISOString() + '-sales-report'

    generateCSV(filename, csvData())
  }

  // If Component is Unloaded
  onUnmounted(() => {
    reportsStore.$reset()
  })

  // Load Functions during component rendering
  onMounted(async () => {
    if (branchesStore.branches.length == 0) await branchesStore.getBranches()
    if (salesStore.customers.length == 0) await salesStore.getCustomers()
  })

  // expose managed state as return value
  return {
    date,
    tableHeaders,
    tableOptions,
    tableFilters,
    itemData,
    isViewProductsDialog,
    isViewPaymentsDialog,
    isCodeFormDialogVisible,
    isConfirmDeleteDialog,
    getDiscount,
    getPaymentBalance,
    onCodeVerified,
    onDelete,
    onConfirmDelete,
    onViewProducts,
    onViewPayments,
    onFilterDate,
    onFilterItems,
    onLoadItems,
    onGenerate,
    branchesStore,
    salesStore,
    reportsStore
  }
}
