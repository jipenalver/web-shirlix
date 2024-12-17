import { dateShiftFixValue } from '@/utils/helpers'
import { useAuthUserStore } from './authUser'
import { supabase } from '@/utils/supabase'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSummaryStore = defineStore('summary', () => {
  // Use Pinia Store
  const authStore = useAuthUserStore()

  // States

  const summaryReport = ref([])

  // Reset State Action
  function $reset() {
    summaryReport.value = []
  }

  // Retrieve Stocks Report
  async function getSummaryReport(tableOptions, { branch_id, date_range }) {
    let query = supabase
      .from('stock_ins')
      .select('unit_cost, purchased_at')
      .eq('is_segregated', true)

    query = getSummaryFilter(query, { branch_id, date_range }, 'purchased_at')

    // Execute the query
    const { data } = await query

    // Set the retrieved data to state
    summaryReport.value = data
  }

  // Filter Stocks
  async function getSummaryFilter(query, { branch_id, date_range }, date_key = 'created_at') {
    if (branch_id) query = query.eq('branch_id', branch_id)
    // If branch is not set, get the branch(es) of the user
    else {
      if (authStore.authBranchIds.value.length === 0) await authStore.getAuthBranchIds()

      query = query.in('branch_id', authStore.authBranchIds)
    }

    if (date_range) {
      if (date_range.length === 1) query = query.eq(date_key, dateShiftFixValue(date_range[0]))
      else {
        query = query
          .gte(date_key, dateShiftFixValue(date_range[0])) // Greater than or equal to `from` date
          .lte(date_key, dateShiftFixValue(date_range[date_range.length - 1])) // Less than or equal to `to` date
      }
    }

    return query
  }

  return {
    summaryReport,
    $reset,
    getSummaryReport
  }
})
