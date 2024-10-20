import { createClient } from '@supabase/supabase-js'

// 👉 Create a single supabase client for interacting with your database
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// 👉 Create a single supabase admin client for interacting auth users
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 👉 Check if the session exists and is valid; Return false if there's an error
export const isAuthenticated = async () => {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting session:', error.message)
    return false
  }

  return !!data.session
}

// 👉 Form Action utils
export const formActionDefault = {
  formProcess: false,
  formStatus: 200,
  formErrorMessage: '',
  formSuccessMessage: ''
}

// 👉 Supabase Pagination
export const tablePagination = (
  page,
  itemsPerPage,
  sortBy,
  defaultColumn = '',
  isAscending = true
) => {
  const rangeStart = (page - 1) * itemsPerPage
  const rangeEnd = rangeStart + itemsPerPage - 1
  const [column, order] = sortBy[0]
    ? [sortBy[0].key, sortBy[0].order === 'asc']
    : [defaultColumn, isAscending]

  return { rangeStart, rangeEnd, column, order }
}
