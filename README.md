# XML to Excel Converter

A modern web application that converts XML files to Excel format with preview and filtering capabilities.

## Features

- **Drag & Drop Upload**: Easy file upload with drag and drop support
- **Real-time Preview**: View converted data before downloading
- **Column Filtering**: Show/hide specific columns
- **Search Functionality**: Filter data by search terms
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Download Excel**: Generate and download Excel files

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Flask, Python, Pandas, OpenPyXL
- **File Processing**: XML parsing with ElementTree, Excel generation with Pandas

## Setup

1. **Install Dependencies**:
   \`\`\`bash
   # Python dependencies
   cd flask-backend
   pip install -r requirements.txt
   
   # Node.js dependencies
   cd ..
   npm install
   \`\`\`

2. **Run the Application**:
   \`\`\`bash
   # Terminal 1: Start Flask backend
   cd flask-backend
   python app.py
   
   # Terminal 2: Start Next.js frontend
   npm run dev
   \`\`\`

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage

1. Upload an XML file using drag & drop or file browser
2. Click "Convert to Excel" to process the file
3. Preview the converted data in the table
4. Use search and column filters to explore the data
5. Download the Excel file when ready

## API Endpoints

- `POST /api/convert` - Convert XML file and return preview data
- `POST /api/download` - Generate and download Excel file

## File Structure

\`\`\`
├── flask-backend/
│   ├── app.py              # Flask application
│   └── requirements.txt    # Python dependencies
├── app/
│   └── page.tsx           # Main Next.js page
├── components/ui/         # shadcn/ui components
└── package.json          # Node.js dependencies
