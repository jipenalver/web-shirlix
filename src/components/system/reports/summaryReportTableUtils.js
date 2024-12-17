import { dateShiftFixValue } from '@/utils/helpers'

// Table Headers
export const tableHeaders = [
  {
    title: 'Date',
    key: 'date',
    sortable: false,
    align: 'start'
  },

  {
    title: 'Inventory',
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
    title: 'Accounts Receivable',
    key: 'receivable',
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
    const date = dateShiftFixValue(new Date(item.date))
    acc[date] = acc[date] || []
    acc[date].push(item)
    return acc
  }, {})
}

// Sum amounts by type
export const sumByType = (entries, type) => {
  return entries
    .filter((entry) => entry.type === type)
    .reduce((acc, entry) => acc + entry.amount, 0)
}
