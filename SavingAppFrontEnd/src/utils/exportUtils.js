export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h] ?? ''
        return `"${String(val).replace(/"/g, '""')}"`
      }).join(',')
    )
  ]

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export const formatExpensesForExport = (expenses) => {
  return expenses.map(e => ({
    Date: e.expenseDate,
    Description: e.description || '',
    Category: e.category,
    Account: e.accountName,
    Type: e.transactionType,
    Amount: e.amount,
    Merchant: e.merchant || ''
  }))
}