import json
import pandas as pd
import xml.etree.ElementTree as ET
import io
import base64

def handler(event, context):
    try:
        # Parse the request
        if event['httpMethod'] != 'POST':
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
        
        # Handle file upload (base64 encoded)
        body = json.loads(event['body'])
        xml_content = body.get('xmlContent', '')
        
        if not xml_content:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'No XML content provided'})
            }
        
        # Process XML
        converter = XMLToExcelConverter()
        count, data = converter.process_xml(xml_content)
        
        if count == 0:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'No data found in XML file'})
            }
        
        # Return preview data
        preview_data = data[:100] if len(data) > 100 else data
        columns = list(data[0].keys()) if data else []
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'count': count,
                'columns': columns,
                'preview': preview_data,
                'hasMore': len(data) > 100
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }

class XMLToExcelConverter:
    def __init__(self):
        self.df = None
        self.data = []

    def process_xml(self, xml_content):
        try:
            tree = ET.ElementTree(ET.fromstring(xml_content))
            root = tree.getroot()
            transactions = []
            
            elements = root.findall('.//transaction') or root.findall('.//*')
            if not elements:
                elements = [root]
            
            for element in elements:
                trans_data = {}
                self.flatten_element(element, aggregated_data=trans_data)
                if trans_data:
                    transactions.append(trans_data)
            
            self.data = transactions
            self.df = pd.DataFrame(transactions)
            
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
        
        for attr_name, attr_value in element.attrib.items():
            attr_path = f"{element_path}@{attr_name}"
            aggregated_data[attr_path] = attr_value
        
        has_children = False
        for child in element:
            has_children = True
            self.flatten_element(child, element_path, aggregated_data, counter)
        
        if not has_children and element.text and element.text.strip():
            aggregated_data[element_path] = element.text.strip()
