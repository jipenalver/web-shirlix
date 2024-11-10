// 👉 Avatar Text Initials
export const getAvatarText = (name) => {
  const nameParts = name.trim().split(' ').filter(Boolean)

  const initials = nameParts.slice(0, 2).map((part) => part[0].toUpperCase())

  return initials.join('')
}

// 👉 Slug Name
export const getSlugText = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 23)
}

// 👉 Money Format Text
export const getMoneyText = (value) => {
  if (isNaN(value)) return '₱0.00'

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// 👉 Alpha-numeric Random Code
export const getRandomCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join(
    ''
  )
}

// 👉 Pad String Left
export const getPadLeftText = (value, length = 4, char = '0') => {
  value = String(value)
  if (value.length >= length) return value
  return char.repeat(length - value.length) + value
}

// 👉 File Extraction of Object, for 1 File/Image
export const fileExtract = (event) => {
  return new Promise((resolve, reject) => {
    const { files } = event.target

    if (!files || !files.length) return reject(new Error('No files selected'))

    const fileReader = new FileReader()
    fileReader.readAsDataURL(files[0])

    fileReader.onload = () => {
      if (typeof fileReader.result === 'string')
        resolve({ fileObject: files[0], fileUrl: fileReader.result })
      else reject(new Error('Failed to read file as Data URL'))
    }

    fileReader.onerror = () => reject(new Error('Error reading file'))
  })
}

// 👉 File Extraction of Object, for Multiple Files/Images
export const filesExtract = (event) => {
  return new Promise((resolve, reject) => {
    const { files } = event.target

    if (!files || !files.length) return reject(new Error('No files selected'))

    const fileObjects = Array.from(files)
    const fileReaders = fileObjects.map((file) => {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.readAsDataURL(file)

        fileReader.onload = () => {
          if (typeof fileReader.result === 'string')
            resolve({ fileObject: file, fileUrl: fileReader.result })
          else reject(new Error('Failed to read file as Data URL'))
        }

        fileReader.onerror = () => reject(new Error('Error reading file'))
      })
    })

    Promise.all(fileReaders)
      .then((results) => {
        const fileUrls = results.map((result) => result.fileUrl)
        resolve({ fileObjects, fileUrls })
      })
      .catch((error) => reject(error))
  })
}

// 👉 Fix v-date-input datetime shift issue for form
export const dateShiftFixForm = (vueDate, formData, dateColumns = []) => {
  dateColumns.forEach((dateColumn) => {
    if (formData[dateColumn])
      formData = {
        ...formData,
        [dateColumn]: vueDate.addDays(formData[dateColumn], 1) // Add 1 day to the date field
      }
  })

  return formData
}

// 👉 Fix v-date-input datetime shift issue for value
export const dateShiftFixValue = (vueDate, date) => {
  return vueDate.addDays(date, 1)
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
