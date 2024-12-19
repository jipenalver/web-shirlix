// Default Category Colors
export const categoryColors = ['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800']

// Default Options Value
export const defaultOptions = {
  chart: {
    height: 350,
    type: 'bar',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    }
  },
  tooltip: {
    theme: ''
  },
  plotOptions: {
    bar: {
      columnWidth: '45%',
      distributed: true
    }
  },
  dataLabels: {
    enabled: true
  },
  legend: {
    show: true,
    labels: {
      colors: '#C62828'
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: '#C62828',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    },
    title: {
      text: 'Quantity',
      style: {
        color: '#C62828'
      }
    }
  },
  colors: [],
  xaxis: {
    type: 'category',
    categories: [],
    labels: {
      style: {
        colors: '#C62828',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    },
    title: {
      text: 'Products',
      style: {
        color: '#C62828'
      }
    }
  }
}

// Default Series Value
export const defaultSeries = [
  {
    name: 'Quantity',
    data: []
  }
]

// Category Text Formatter
export const categoryTextFormatter = (name) => {
  const words = name.split(' ')
  const WORD_LIMIT = 3
  const CHAR_LIMIT = 20

  if (words.length > WORD_LIMIT) {
    const initials = words
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
    const remainingWords = words.slice(2).join(' ')
    const formattedName = `${initials} ${remainingWords}`

    return formattedName.length > CHAR_LIMIT
      ? `${formattedName.substring(0, CHAR_LIMIT - 3)}...`
      : formattedName
  }

  return name.length > CHAR_LIMIT ? `${name.substring(0, CHAR_LIMIT - 3)}...` : name
}
