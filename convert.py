import sys
import os
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../utils')
from xml_to_excel import XMLToExcelConverter
from io import BytesIO

def handler(request):
    try:
        if request.method != "POST":
            return {
                "statusCode": 405,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Only POST allowed"})
            }

        form_data = request.files
        if 'file' not in form_data:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Missing 'file' in form data"})
            }

        uploaded_file = form_data['file']
        xml_content = uploaded_file.read().decode('utf-8')
        converter = XMLToExcelConverter()
        count, _ = converter.process_xml(xml_content)
        excel_bytes = converter.get_excel_bytes()

        if excel_bytes is None:
            return {
                "statusCode": 500,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Failed to convert XML to Excel"})
            }

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": f'attachment; filename="output.xlsx"'
            },
            "body": excel_bytes.read(),
            "isBase64Encoded": True
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)})
        }
