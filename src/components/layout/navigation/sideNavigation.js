// 👉 Main Navigation; Title, Icon
export const mainNav = [
  ['User Management', 'mdi-account-box-multiple'],
  ['Product Management', 'mdi-clipboard-list'],
  ['Inventory', 'mdi-invoice-list'],
  ['Expenses Management', 'mdi-cash-register'],
  ['Reporting', 'mdi-file-chart']
]

// 👉 Sub Navigations; Title, Icon, Subtitle, Redirect Path
export const menuItemsNav1 = [
  ['List of Branches', 'mdi-store', '', '/manage/branches'],
  ['User Roles', 'mdi-tag-multiple', '', '/manage/user/roles'],
  ['Users Management', 'mdi-account-multiple', '', '/manage/users']
]
export const menuItemsNav2 = [
  ['Product Information', 'mdi-information-box', 'Add and Manage Products', '/products']
]
export const menuItemsNav3 = [
  ['Stock In', 'mdi-tray-arrow-down', 'Add Stocks on Products', '/inventory/stockin'],
  ['Stock Weight', 'mdi-weight-kilogram', 'Track Weight of Products', '/inventory/weight'],
  ['Sales', 'mdi-tray-arrow-up', 'Sell Products', '/inventory/sales']
  // ['Payments', 'mdi-account-credit-card', 'Track Customer Payments', '/inventory/payments']
]
export const menuItemsNav4 = [
  ['Expenditures', 'mdi-cash-remove', 'Tally and Manage Expenses', '/expenses']
]
export const menuItemsNav5 = [
  ['Balance Sheet', 'mdi-scale-balance', '', '/reports/balance'],
  ['Stock In', 'mdi-cash-plus', 'Stock In of Products Report', '/reports/stockin'],
  ['Sales', 'mdi-sale', 'Sold Products Report', '/reports/sales'],
  ['Expenses', 'mdi-cash-multiple', 'Expenditure Reports', '/reports/expenses']
]
