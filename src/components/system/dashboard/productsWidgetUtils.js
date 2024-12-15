export const baseColors = ['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800']

export const otherOptions = {
  chart: {
    height: 350,
    type: 'bar',
    toolbar: {
      show: false
    }
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
  }
}
