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
  ['Purchases', 'mdi-tray-arrow-down', '', ''],
  ['Sales', 'mdi-tray-arrow-up', '', '']
]
export const menuItemsNav4 = [
  ['Expenditures', 'mdi-cash-remove', 'Tally and Manage Expenses', '/expenses']
]
export const menuItemsNav5 = [
  ['Balance Sheet', 'mdi-scale-balance', '', ''],
  ['Purchases', 'mdi-cash-plus', '', ''],
  ['Sales', 'mdi-sale', '', ''],
  ['Expenses', 'mdi-cash-multiple', 'Generate CSV', '/reports/expenses']
]
