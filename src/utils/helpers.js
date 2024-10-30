// 👉 Avatar Text Initials
export const getAvatarText = (name) => {
  const nameParts = name.trim().split(' ').filter(Boolean)

  const initials = nameParts.slice(0, 2).map((part) => part[0].toUpperCase())

  return initials.join('')
}

// 👉 Fix v-date-input datetime shift issue
export const dateShiftFix = (vueDate, formData, dateColumns = []) => {
  dateColumns.forEach((dateColumn) => {
    if (formData[dateColumn])
      formData = {
        ...formData,
        [dateColumn]: vueDate.addDays(formData[dateColumn], 1) // Add 1 day to the date field
      }
  })

  return formData
}

// 👉 Generate CSV
export const generateCSV = (filename, csvData) => {
  const blob = new Blob([csvData], { type: 'text/csv; charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')

  link.href = url
  link.setAttribute('download', `${filename}.csv`)

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  link.remove()

  URL.revokeObjectURL(url)
}

// 👉 CSV Text Trimming
export const generateCSVTrim = (string) => {
  return string.replace(/,/g, ' ').replace(/\s+/g, ' ')
}
