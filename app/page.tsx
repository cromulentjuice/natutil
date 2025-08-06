'use client'

import { useState, useCallback } from 'react'
import { Upload, Download, FileText, Filter, Search, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

interface ConversionResult {
  success: boolean
  count: number
  columns: string[]
  preview: Record<string, any>[]
  hasMore: boolean
}

export default function XMLToExcelConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [xmlContent, setXmlContent] = useState('')

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'text/xml' || droppedFile.name.endsWith('.xml')) {
        setFile(droppedFile)
        setError('')
      } else {
        setError('Please upload an XML file')
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  const handleConvert = async () => {
    if (!file) {
      setError('Please select an XML file')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    // Store XML content for download
    const reader = new FileReader()
    reader.onload = (e) => {
      setXmlContent(e.target?.result as string)
    }
    reader.readAsText(file)

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed')
      }

      setResult(data)
      setSelectedColumns(data.columns)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!xmlContent) {
      setError('No data to download')
      return
    }

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xmlContent }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'converted_data.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const filteredData = result?.preview.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || []

  const visibleColumns = selectedColumns.filter(col =>
    result?.columns.includes(col)
  )

  const toggleColumn = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6 bg-zinc-950 text-zinc-100 border-4 border-slate-500 rounded-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-zinc-100">Python & Node.js XML Converter</h1>
          <p className="text-lg text-zinc-500">Powered by Python backend &amp; Node.js frontend - Upload XML to preview &amp; convert to Excel</p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload XML File
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Select or drag and drop XML file to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileText className="h-12 w-12 mx-auto mb-4 text-zinc-400" />
              <div className="space-y-2 text-zinc-100">
                <p className="text-lg font-medium text-zinc-500">
                  {file ? file.name : 'Drop your XML file here'}
                </p>
                <p className="text-sm text-gray-500">or</p>
                <Label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Browse Files
                  </Button>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xml"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </Label>
              </div>
            </div>

            {file && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null)
                      setResult(null)
                      setError('')
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2 mb-0 py-0 ml-80 mr-80 flex-row shadow border-zinc-100 border opacity-100 rounded bg-zinc-900">
              <Button
                onClick={handleConvert}
                disabled={!file || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Convert to Excel
                  </>
                )}
              </Button>
            </div>

            {loading && (
              <div className="mt-4">
                <Progress value={33} className="w-full" />
                <p className="text-sm text-gray-500 mt-2">Processing XML file...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{result.count}</div>
                    <div className="text-sm text-blue-800">Total Records</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{result.columns.length}</div>
                    <div className="text-sm text-green-800">Columns</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{result.preview.length}</div>
                    <div className="text-sm text-purple-800">Preview Rows</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Data Preview & Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search data..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleDownload} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Excel
                  </Button>
                </div>

                {/* Column Selection */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Visible Columns:</Label>
                  <div className="flex flex-wrap gap-2">
                    {result.columns.map((column) => (
                      <Badge
                        key={column}
                        variant={selectedColumns.includes(column) ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleColumn(column)}
                      >
                        {column}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  Showing {filteredData.length} of {result.count} records
                  {result.hasMore && " (preview limited to first 100 rows)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {visibleColumns.map((column) => (
                          <TableHead key={column} className="whitespace-nowrap">
                            {column}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((row, index) => (
                        <TableRow key={index}>
                          {visibleColumns.map((column) => (
                            <TableCell key={column} className="max-w-xs truncate">
                              {row[column] || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No data matches your search criteria
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
