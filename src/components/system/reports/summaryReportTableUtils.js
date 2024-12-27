import { getAccumulatedNumber, prepareDate } from '@/utils/helpers'

// Table Headers
export const tableHeaders = [
  {
    title: 'Date',
    key: 'date',
    align: 'start'
  },

  {
    title: 'Inventory Cost',
    key: 'inventory',
    sortable: false,
    align: 'start'
  },

  {
    title: 'Gross Profit',
    key: 'profit_gross',
    sortable: false,
    align: 'start'
  },

  {
    title: 'Discounts',
    key: 'discount',
    sortable: false,
    align: 'start'
  },
  {
    title: 'Collectibles',
    key: 'collectible',
    sortable: false,
    align: 'start'
  },

  {
    title: 'Expenses',
    key: 'expenses',
    sortable: false,
    align: 'center'
  },
  {
    title: 'Net Profit',
    key: 'profit_net',
    sortable: false,
    align: 'center'
  }
]

// Group data by date
export const groupByDate = (data) => {
  return data.reduce((acc, item) => {
    const date = prepareDate(item.date)
    acc[date] = acc[date] || []
    acc[date].push(item)
    return acc
  }, {})
}

// Sum amounts by type
export const sumByType = (entries, type) => {
  return getAccumulatedNumber(
    entries.filter((entry) => entry.type === type),
    'amount'
  )
}
