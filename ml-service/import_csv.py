"""
CSV Data Importer for Customer Segmentation System
This script loads Mall Customers CSV data into MongoDB via the backend API.
"""

import pandas as pd
import requests
import json
import sys

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Configuration
CSV_FILE_PATH = '../data/raw/Mall_Customers.csv'
BACKEND_API_URL = 'http://localhost:5000/api/customers/bulk-import'

def load_csv_to_database():
    """Load CSV file and import to database."""
    
    print("=" * 60)
    print("Customer Data Importer")
    print("=" * 60)
    
    try:
        # Read CSV file
        print(f"\n[*] Reading CSV file: {CSV_FILE_PATH}")
        df = pd.read_csv(CSV_FILE_PATH)
        
        print(f"[+] Found {len(df)} customers in CSV")
        print(f"\nColumns: {list(df.columns)}")
        
        # Display first few rows
        print("\n[*] Sample data:")
        print(df.head())
        
        # Convert to required format
        customers = []
        for _, row in df.iterrows():
            customer = {
                'CustomerID': int(row.get('CustomerID', row.name + 1)),
                'Gender': str(row.get('Gender', 'Other')),
                'Age': int(row.get('Age', 0)),
                'AnnualIncome': int(row.get('Annual Income (k$)', 0)),
                'SpendingScore': int(row.get('Spending Score (1-100)', 0))
            }
            customers.append(customer)
        
        # Send to backend API
        print(f"\n[*] Uploading {len(customers)} customers to database...")
        
        response = requests.post(
            BACKEND_API_URL,
            json={'customers': customers},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("\n[SUCCESS] Import successful!")
            print(f"Statistics:")
            print(f"   - Inserted: {result['stats']['inserted']}")
            print(f"   - Updated: {result['stats']['updated']}")
            print(f"   - Total: {result['stats']['total']}")
        else:
            print(f"\n[ERROR] Status code: {response.status_code}")
            print(response.text)
            
    except FileNotFoundError:
        print(f"\n[ERROR] CSV file not found at {CSV_FILE_PATH}")
        print("\nPlease make sure:")
        print("1. CSV file is in data/raw/ folder")
        print("2. File name is correct")
        
    except Exception as e:
        print(f"\n[ERROR] {str(e)}")
        print("\nPlease check:")
        print("1. Backend server is running on http://localhost:5000")
        print("2. CSV file format is correct")
        print("3. Required columns exist")

if __name__ == '__main__':
    load_csv_to_database()
