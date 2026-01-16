# CSV Data Import Guide

## आपकी CSV File को Database में Load करें

### Step 1: CSV File Check करें

आपकी CSV file इस format में होनी चाहिए:

```csv
CustomerID,Gender,Age,Annual Income (k$),Spending Score (1-100)
1,Male,19,15,39
2,Male,21,15,81
3,Female,20,16,6
...
```

### Step 2: Import Script चलाएं

```bash
cd ml-service
python import_csv.py
```

### Expected Output:

```
============================================================
Customer Data Importer
============================================================

📂 Reading CSV file: ../data/raw/Mall_Customers.csv
✅ Found 200 customers in CSV

Columns: ['CustomerID', 'Gender', 'Age', 'Annual Income (k$)', 'Spending Score (1-100)']

📊 Sample data:
   CustomerID  Gender  Age  Annual Income (k$)  Spending Score (1-100)
0           1    Male   19                  15                      39
1           2    Male   21                  15                      81
...

🚀 Uploading 200 customers to database...

✅ Import successful!
📊 Statistics:
   - Inserted: 200
   - Updated: 0
   - Total: 200
```

## Alternative: UI से Load करें

अगर script नहीं चलाना चाहते, तो Dashboard पर जाकर **"Load Sample Data"** button use करें। यह automatic sample data generate करेगा।

## Troubleshooting

### Error: File not found
- Check करें कि CSV file `data/raw/` folder में है
- File name सही है: `Mall_Customers.csv`

### Error: Connection refused
- Backend server चल रहा है? (`npm run dev` in backend folder)
- Check URL: http://localhost:5000

### Error: Invalid columns
- CSV में ये columns होने चाहिए:
  - CustomerID
  - Gender
  - Age
  - Annual Income (k$)
  - Spending Score (1-100)

## Next Steps

Data import करने के बाद:
1. Dashboard पर जाएं - Statistics देखें
2. Analysis page पर जाएं
3. "Run Clustering" करें
4. Results देखें! 🎯
