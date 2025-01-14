/* eslint-disable no-unused-vars */
import {
  prepareFormDates,
  prepareDate,
  getPreciseNumber,
  getAccumulatedNumber
} from '@/utils/helpers'
import { supabase, tablePagination, tableSearch } from '@/utils/supabase'
import { useAuthUserStore } from './authUser'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStockInStore = defineStore('stockIn', () => {
  // Use Pinia Store
  const authStore = useAuthUserStore()

  // States
  const stockInTable = ref([])
  const stockInTotal = ref(0)
  const stockTransferTable = ref([])
  const stockTransferTotal = ref(0)

  // Reset State Action
  function $reset() {
    stockInTable.value = []
    stockTransferTable.value = []
    stockInTotal.value = 0
    stockTransferTotal.value = 0
  }

  // Retrieve StockIn Table
  async function getStockInTable(
    { isNotSegregated, ...options },
    { search, product_id, branch_id, purchased_at }
  ) {
    const { rangeStart, rangeEnd, column, order } = tablePagination(options, 'purchased_at', false) // Default Column to be sorted, add 3rd params, boolean if ascending or not, default is true
    search = tableSearch(search) // Handle Search if null turn to empty string

    // Query Supabase with pagination and sorting
    let query = supabase.from('stock_ins')

    if (isNotSegregated)
      query = query
        .select(
          '*, branches( name ), products( name, image_url, description ), sale_products( qty )'
        )
        .eq('is_segregated', false)
    else query = query.select('*, branches( name ), products( name, image_url, description )')

    query = query.order(column, { ascending: order }).range(rangeStart, rangeEnd)

    query = getStockInFilter(query, { search, product_id, branch_id, purchased_at })

    // Execute the query
    const { data } = await query

    // Separate query to get the total count without range
    const { count } = await getStockInCount(
      { isNotSegregated },
      { search, product_id, branch_id, purchased_at }
    )

    // Set the retrieved data to state
    if (isNotSegregated) {
      // Filter the data to get the remaining qty
      const getRemainingQty = (item) =>
        getPreciseNumber(item.qty_reweighed - getAccumulatedNumber(item.sale_products, 'qty'))
      const filteredData = data.filter((item) => getRemainingQty(item) > 0)

      stockTransferTable.value = filteredData
      stockTransferTotal.value = filteredData.length
    } else {
      stockInTable.value = data
      stockInTotal.value = count
    }
  }

  // Count StockIn
  async function getStockInCount(
    { isNotSegregated },
    { search, product_id, branch_id, purchased_at }
  ) {
    let query = supabase
      .from('stock_ins')
      .select('*, branches( name ), products( name )', { count: 'exact', head: true })

    if (isNotSegregated) query = query.eq('is_segregated', false)

    query = getStockInFilter(query, { search, product_id, branch_id, purchased_at })

    return await query
  }

  // Filter StockIn
  async function getStockInFilter(query, { search, product_id, branch_id, purchased_at }) {
    if (search) {
      if (search.length >= 4 && !isNaN(search))
        query = query.or('id.eq.' + search + ', stock_in_id.eq.' + search)
      else query = query.or('supplier.ilike.%' + search + '%, remarks.ilike.%' + search + '%')
    }

    if (product_id) query = query.eq('product_id', product_id)

    if (branch_id) query = query.eq('branch_id', branch_id)
    // If branch is not set, get the branch(es) of the user
    else {
      if (authStore.authBranchIds.length === 0) await authStore.getAuthBranchIds()

      query = query.in('branch_id', authStore.authBranchIds)
    }

    if (purchased_at) {
      if (purchased_at.length === 1) query = query.eq('purchased_at', prepareDate(purchased_at[0]))
      else {
        query = query
          .gte('purchased_at', prepareDate(purchased_at[0])) // Greater than or equal to `from` date
          .lte('purchased_at', prepareDate(purchased_at[purchased_at.length - 1])) // Less than or equal to `to` date
      }
    }

    return query
  }

  // Add StockIn
  async function addStockIn(formData, repetition = 1) {
    const preparedData = prepareFormDates(formData, ['purchased_at', 'expired_at'])

    const formDatas = Array.from({ length: repetition || 1 }, () => ({
      ...preparedData,
      last_updated_id: authStore.userData.id
    }))

    return await supabase.from('stock_ins').insert(formDatas).select()
  }

  // Update StockIn; if you put arg stockId will assume a customized formData
  async function updateStockIn(formData, stockId = null) {
    let transformedData = {}
    if (stockId) transformedData = formData
    else {
      const { branches, products, ...data } = prepareFormDates(formData, [
        'purchased_at',
        'expired_at'
      ])
      transformedData = data
    }

    return await supabase
      .from('stock_ins')
      .update({ ...transformedData, last_updated_id: authStore.userData.id })
      .eq('id', stockId ?? formData.id)
      .select()
  }

  // Delete StockIn
  async function deleteStockIn(id) {
    return await supabase.from('stock_ins').delete().eq('id', id)
  }

  // Add Stock Portion
  async function addStockPortion(formData, stockId) {
    const transformedData = formData.map((value) => {
      const { product_id, product_preview, qty, ...stockData } = value

      return {
        ...stockData,
        qty: qty,
        qty_reweighed: qty,
        product_id: product_id.id,
        last_updated_id: authStore.userData.id
      }
    })

    // Update segregated status
    await updateStockIn({ is_segregated: true }, stockId)

    return await supabase.from('stock_ins').insert(transformedData).select()
  }

  // Retrieve Stocks Transfer List
  async function getStocksTransferList(itemData) {
    let query = supabase
      .from('stock_ins')
      .select('*, products( name, image_url, description ), sale_products( qty )')
      .order('purchased_at', { ascending: false })
      .eq('branch_id', itemData.branch_id)
      .eq('product_id', itemData.product_id)
      .eq('is_segregated', false)

    // Execute the query
    const { data } = await query

    // Set the retrieved data to state
    return data.filter(
      (item) =>
        getPreciseNumber(
          (item.qty_reweighed ?? item.qty) - getAccumulatedNumber(item.sale_products, 'qty')
        ) > 0
    )
  }

  // Request Stock Transfer
  async function requestStockTransfer(formData) {
    const { id, created_at, branches, products, sale_products, old_qty, ...stockData } = formData

    return await supabase
      .from('stock_ins')
      .update({
        is_transfer_request: true,
        transfer_metadata: {
          add: {
            ...stockData,
            qty_reweighed: stockData.is_reweighed ? stockData.qty : null,
            last_updated_id: authStore.userData.id
          },
          update: {
            qty: getPreciseNumber(old_qty - stockData.qty),
            qty_reweighed: stockData.is_reweighed
              ? getPreciseNumber(old_qty - stockData.qty)
              : null,
            last_updated_id: authStore.userData.id,
            request_metadata: {
              request_at: new Date().toISOString(),
              request_by: authStore.userData.firstname + ' ' + authStore.userData.lastname
            }
          }
        }
      })
      .eq('id', id)
      .select()
  }

  // Approve Stock Transfer
  async function approveStockTransfer(formData) {
    const {
      id,
      transfer_metadata: {
        add: { branch_id, ...addData },
        update: { request_metadata, ...updateData }
      }
    } = formData

    await supabase
      .from('stock_ins')
      .update({ ...updateData, is_transfer_request: false, transfer_metadata: null })
      .eq('id', id)
      .select()

    return await supabase
      .from('stock_ins')
      .insert([{ ...addData, branch_id: branch_id.id }])
      .select()
  }

  // Disapprove Stock Transfer
  async function disapproveStockTransfer(id) {
    return await supabase
      .from('stock_ins')
      .update({
        is_transfer_request: false,
        transfer_metadata: null
      })
      .eq('id', id)
      .select()
  }

  return {
    stockInTable,
    stockInTotal,
    stockTransferTable,
    stockTransferTotal,
    $reset,
    getStockInTable,
    addStockIn,
    updateStockIn,
    deleteStockIn,
    addStockPortion,
    getStocksTransferList,
    requestStockTransfer,
    approveStockTransfer,
    disapproveStockTransfer
  }
})
