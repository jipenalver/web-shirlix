// Table Headers
export const tableHeaders = [
  {
    title: 'Sale ID',
    key: 'id',
    align: 'start'
  },

  {
    title: 'Paid Amount',
    key: 'overall_price',
    align: 'start'
  },
  {
    title: 'Discount',
    key: 'discount',
    sortable: false,
    align: 'start'
  },
  {
    title: 'Amount w/o Discount',
    key: 'exact_price',
    align: 'start'
  },

  {
    title: 'Customer',
    key: 'customer_id',
    sortable: false,
    align: 'start'
  },
  {
    title: 'Branch',
    key: 'branch_id',
    sortable: false,
    align: 'start'
  },

  {
    title: 'Sold Date',
    key: 'created_at',
    align: 'start'
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    align: 'center'
  }
]
