// 👉 Main Navigation; Title, Icon
export const mainNav = [
  ['User Management', 'mdi-account-box-multiple'],
  ['Product Management', 'mdi-clipboard-list'],
  ['Inventory Management', 'mdi-invoice-list'],
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
  ['Stock Transfer', 'mdi-store-marker', 'Multi-Branch Stock Transfers', '/inventory/transfer'],
  ['Stock Segregation', 'mdi-tray-full', 'Track Weight and Segregation', '/inventory/segregate'],
  ['Check Out', 'mdi-cart-variant', 'Sell Products', '/inventory/sales']
]
export const menuItemsNav4 = [
  ['Expenditures', 'mdi-cash-remove', 'Tally and Manage Expenses', '/expenses']
]
export const menuItemsNav5 = [
  ['Products', 'mdi-food-takeout-box', 'Products Inventory Report', '/reports/products'],
  ['Stocks', 'mdi-poll', 'Stocks of Products Report', '/reports/stocks'],
  ['Sales Status', 'mdi-sale', 'Sold Products Report', '/reports/sales'],
  ['Sales Summary', 'mdi-counter', 'Sales and Expenses Report', '/reports/summary'],
  ['Expenses', 'mdi-cash-multiple', 'Expenditures Report', '/reports/expenses']
]
