import pandas as pd
import xml.etree.ElementTree as ET
import io

class XMLToExcelConverter:
    def __init__(self):
        self.df = None

    def process_xml(self, xml_content):
        tree = ET.ElementTree(ET.fromstring(xml_content))
        root = tree.getroot()
        transactions = []
        for transaction in root.findall('.//transaction'):
            trans_data = {}
            self.flatten_element(transaction, aggregated_data=trans_data)
            transactions.append(trans_data)
        self.df = pd.DataFrame(transactions)
        if self.df.empty:
            return 0, []
        return len(transactions), transactions

    def flatten_element(self, element, path='', aggregated_data=None, counter=None):
        if aggregated_data is None:
            aggregated_data = {}
        if counter is None:
            counter = {}
        element_path = f"{path}/{element.tag}" if path else element.tag
        counter[element_path] = counter.get(element_path, 0) + 1
        if counter[element_path] > 1:
            element_path += f"_{counter[element_path]}"
        for child in element:
            self.flatten_element(child, element_path, aggregated_data, counter)
        if element.text and element.text.strip():
            aggregated_data[element_path] = element.text.strip()

    def reorder_dataframe_columns(self, df):
        def sort_key(col):
            parts = col.split('/')
            transformed_parts, numeric_suffix = [], 1
            for part in parts:
                if '_' in part:
                    base, suffix = part.rsplit('_', 1)
                    if suffix.isdigit():
                        numeric_suffix = int(suffix)
                        transformed_parts.append(base)
                        continue
                transformed_parts.append(part)
            return (*transformed_parts, numeric_suffix)
        sorted_columns = sorted(df.columns, key=sort_key)
        return df[sorted_columns]

    def get_excel_bytes(self):
        if self.df is not None:
            self.df = self.reorder_dataframe_columns(self.df)
            output = io.BytesIO()
            self.df.to_excel(output, index=False)
            output.seek(0)
            return output
        return None
