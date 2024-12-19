// 👉 IsEmpty
export const isEmpty = (value) => {
  // Null, undefined, or empty string
  if (value === null || value === undefined || value === '') return true

  // Check for strings (non-empty strings are not empty)
  if (typeof value === 'string') return value.trim() === ''

  // For all other types, return false
  return false
}

// 👉 IsNullOrUndefined
export const isNullOrUndefined = (value) => {
  return value === null || value === undefined
}

// 👉 IsEmptyArray
export const isEmptyArray = (arr) => {
  return Array.isArray(arr) && arr.length === 0
}

// 👉 IsObject
export const isObject = (obj) =>
  obj !== null && !!obj && typeof obj === 'object' && !Array.isArray(obj)

// 👉 Required Validator
export const requiredValidator = (value) => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return 'This field is required'

  return !!String(value).trim().length || 'This field is required'
}

// 👉 Email Validator
export const emailValidator = (value) => {
  if (isEmpty(value)) return true

  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (Array.isArray(value))
    return (
      value.every((val) => re.test(String(val))) || 'The Email field must be a valid email address'
    )

  return re.test(String(value)) || 'The Email field must be a valid email address'
}

// 👉 Password Validator
export const passwordValidator = (password) => {
  const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()]).{8,}/
  const validPassword = regExp.test(password)

  return (
    // eslint-disable-next-line operator-linebreak
    validPassword ||
    'The password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
  )
}

// 👉 Confirm Password Validator
export const confirmedValidator = (value, target) =>
  value === target || 'The Confirm Password field confirmation does not match'

// 👉 Between Validator
export const betweenValidator = (value, min, max) => {
  const valueAsNumber = Number(value)

  return (
    (Number(min) <= valueAsNumber && Number(max) >= valueAsNumber) ||
    `Enter number between ${min} and ${max}`
  )
}

// 👉 Integer Validator
export const integerValidator = (value) => {
  if (isEmpty(value)) return true

  if (Array.isArray(value))
    return value.every((val) => /^-?[0-9]+$/.test(String(val))) || 'This field must be a number'

  return /^-?[0-9]+$/.test(String(value)) || 'This field must be a number'
}

// 👉 Regex Validator
export const regexValidator = (value, regex) => {
  if (isEmpty(value)) return true

  let regeX = regex
  if (typeof regeX === 'string') regeX = new RegExp(regeX)

  if (Array.isArray(value)) return value.every((val) => regexValidator(val, regeX))

  return regeX.test(String(value)) || "The input doesn't match the expected format"
}

// 👉 Alpha Validator
export const alphaValidator = (value) => {
  if (isEmpty(value)) return true

  return /^[A-Z]*$/i.test(String(value)) || 'The Alpha field may only contain alphabetic characters'
}

// 👉 URL Validator
export const urlValidator = (value) => {
  if (isEmpty(value)) return true

  const re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}[.]{0,1}/

  return re.test(String(value)) || 'URL is invalid'
}

// 👉 Length Validator
export const lengthValidator = (value, length) => {
  if (isEmpty(value)) return true

  return (
    String(value).length >= length ||
    `The Min Character field must be at least ${length} characters`
  )
}

// 👉 Alpha-dash Validator
export const alphaDashValidator = (value) => {
  if (isEmpty(value)) return true

  const valueAsString = String(value)

  return (
    /^[0-9A-Z_-]*$/i.test(valueAsString) ||
    'The input must be alphanumeric and can only include dashes (-) and underscores (_).'
  )
}

// 👉 Image Validator
export const imageValidator = (value) => {
  if (isEmpty(value)) return true

  return !value || !value.length || value[0].size < 2000000 || 'Image size should be less than 2 MB'
}

// 👉 General Date Comparison Validator
export const compareDatesValidator = (
  date1,
  date2,
  operator,
  date1Name = 'first',
  date2Name = 'second'
) => {
  if (isEmpty(date1)) return true

  const d1 = new Date(date1)
  const d2 = new Date(date2)

  if (isNaN(d1) || isNaN(d2)) return 'Invalid date input'

  const time1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime()
  const time2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime()

  const messages = {
    '===': 'Dates must be exactly the same',
    '==': 'Dates must be equal',
    '!==': 'Dates must not be the same',
    '!=': 'Dates must not be equal',
    '>': `The ${date1Name} date must be later than the ${date2Name} date`,
    '>=': `The ${date1Name} date must be the same or later than the ${date2Name} date`,
    '<': `The ${date1Name} date must be earlier than the ${date2Name} date`,
    '<=': `The ${date1Name} date must be the same or earlier than the ${date2Name} date`
  }

  if (!(operator in messages)) return `Invalid operator: ${operator}`

  const comparisons = {
    '===': time1 === time2,
    '==': time1 == time2,
    '!==': time1 !== time2,
    '!=': time1 != time2,
    '>': time1 > time2,
    '>=': time1 >= time2,
    '<': time1 < time2,
    '<=': time1 <= time2
  }

  return comparisons[operator] || messages[operator]
}
