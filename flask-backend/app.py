from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import xml.etree.ElementTree as ET
import io
import json
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
CORS(app)

class XMLToExcelConverter:
    def __init__(self):
        self.df = None
        self.data = []

    def process_xml(self, xml_content):
        try:
            tree = ET.ElementTree(ET.fromstring(xml_content))
            root = tree.getroot()
            transactions = []
            
            # Handle different XML structures
            elements = root.findall('.//transaction') or root.findall('.//*')
            if not elements:
                elements = [root]
            
            for element in elements:
                trans_data = {}
                self.flatten_element(element, aggregated_data=trans_data)
                if trans_data:  # Only add non-empty records
                    transactions.append(trans_data)
            
            self.data = transactions
            self.df = pd.DataFrame(transactions)
            
            if self.df.empty:
                return 0, []
            
            return len(transactions), transactions
        except Exception as e:
            raise Exception(f"Error processing XML: {str(e)}")

    def flatten_element(self, element, path='', aggregated_data=None, counter=None):
        if aggregated_data is None:
            aggregated_data = {}
        if counter is None:
            counter = {}
        
        element_path = f"{path}/{element.tag}" if path else element.tag
        counter[element_path] = counter.get(element_path, 0) + 1
        
        if counter[element_path] > 1:
            element_path += f"_{counter[element_path]}"
        
        # Add attributes as separate fields
        for attr_name, attr_value in element.attrib.items():
            attr_path = f"{element_path}@{attr_name}"
            aggregated_data[attr_path] = attr_value
        
        # Process child elements
        has_children = False
        for child in element:
            has_children = True
            self.flatten_element(child, element_path, aggregated_data, counter)
        
        # If no children and has text content, add the text
        if not has_children and element.text and element.text.strip():
            aggregated_data[element_path] = element.text.strip()

    def get_excel_bytes(self):
        if self.df is not None and not self.df.empty:
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                self.df.to_excel(writer, index=False, sheet_name='Data')
                
                # Auto-adjust column widths
                worksheet = writer.sheets['Data']
                for column in worksheet.columns:
                    max_length = 0
                    column_letter = column[0].column_letter
                    for cell in column:
                        try:
                            if len(str(cell.value)) > max_length:
                                max_length = len(str(cell.value))
                        except:
                            pass
                    adjusted_width = min(max_length + 2, 50)
                    worksheet.column_dimensions[column_letter].width = adjusted_width
            
            output.seek(0)
            return output
        return None

@app.route('/api/convert', methods=['POST'])
def convert_xml():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.lower().endswith('.xml'):
            return jsonify({'error': 'Please upload an XML file'}), 400
        
        xml_content = file.read().decode('utf-8')
        converter = XMLToExcelConverter()
        count, data = converter.process_xml(xml_content)
        
        if count == 0:
            return jsonify({'error': 'No data found in XML file'}), 400
        
        # Return preview data (first 100 rows)
        preview_data = data[:100] if len(data) > 100 else data
        columns = list(data[0].keys()) if data else []
        
        return jsonify({
            'success': True,
            'count': count,
            'columns': columns,
            'preview': preview_data,
            'hasMore': len(data) > 100
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download', methods=['POST'])
def download_excel():
    try:
        data = request.get_json()
        xml_content = data.get('xmlContent')
        
        if not xml_content:
            return jsonify({'error': 'No XML content provided'}), 400
        
        converter = XMLToExcelConverter()
        count, _ = converter.process_xml(xml_content)
        
        if count == 0:
            return jsonify({'error': 'No data found in XML'}), 400
        
        excel_bytes = converter.get_excel_bytes()
        
        if excel_bytes is None:
            return jsonify({'error': 'Failed to generate Excel file'}), 500
        
        return send_file(
            excel_bytes,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='converted_data.xlsx'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
