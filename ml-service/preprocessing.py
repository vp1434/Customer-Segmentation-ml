import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import joblib

class DataPreprocessor:
    """Handle all data preprocessing and feature engineering tasks."""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.pca = None
        self.feature_names = []
        
    def load_customer_data(self, filepath=None, data=None):
        """Load customer data from file or dict."""
        if data is not None:
            df = pd.DataFrame(data)
        elif filepath:
            df = pd.read_csv(filepath)
        else:
            raise ValueError("Either filepath or data must be provided")
        
        return df
    
    def compute_rfm_features(self, transactions_df):
        """
        Compute RFM (Recency, Frequency, Monetary) features from transaction data.
        
        Expected columns: CustomerID, TransactionDate, Amount
        """
        # Convert date to datetime
        transactions_df['TransactionDate'] = pd.to_datetime(transactions_df['TransactionDate'])
        
        # Reference date (most recent transaction + 1 day)
        reference_date = transactions_df['TransactionDate'].max() + pd.Timedelta(days=1)
        
        # Compute RFM
        rfm = transactions_df.groupby('CustomerID').agg({
            'TransactionDate': lambda x: (reference_date - x.max()).days,  # Recency
            'CustomerID': 'count',  # Frequency
            'Amount': 'sum'  # Monetary
        })
        
        rfm.columns = ['Recency', 'Frequency', 'Monetary']
        rfm.reset_index(inplace=True)
        
        return rfm
    
    def handle_missing_values(self, df):
        """Handle missing values in the dataset."""
        # Fill numerical columns with median
        numerical_cols = df.select_dtypes(include=[np.number]).columns
        for col in numerical_cols:
            if df[col].isnull().sum() > 0:
                df[col].fillna(df[col].median(), inplace=True)
        
        # Fill categorical with mode
        categorical_cols = df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            if df[col].isnull().sum() > 0:
                df[col].fillna(df[col].mode()[0], inplace=True)
        
        return df
    
    def encode_categorical(self, df):
        """One-hot encode categorical variables."""
        categorical_cols = df.select_dtypes(include=['object']).columns
        categorical_cols = [col for col in categorical_cols if col not in ['CustomerID']]
        
        if len(categorical_cols) > 0:
            df = pd.get_dummies(df, columns=categorical_cols, drop_first=True)
        
        return df
    
    def log_transform_skewed(self, df, skew_threshold=1.0):
        """Apply log transformation to highly skewed features."""
        numerical_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numerical_cols:
            skewness = df[col].skew()
            if abs(skewness) > skew_threshold and (df[col] >= 0).all():
                df[col] = np.log1p(df[col])  # log(1 + x) to handle zeros
        
        return df
    
    def standardize_features(self, df, feature_cols=None):
        """Standardize features using StandardScaler."""
        if feature_cols is None:
            # Auto-detect numerical columns
            feature_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            # Exclude ID columns
            feature_cols = [col for col in feature_cols if 'ID' not in col.upper()]
        
        self.feature_names = feature_cols
        
        # Fit and transform
        df_scaled = df.copy()
        df_scaled[feature_cols] = self.scaler.fit_transform(df[feature_cols])
        
        return df_scaled, feature_cols
    
    def reduce_dimensions_pca(self, X, n_components=2):
        """Reduce dimensions using PCA for visualization."""
        self.pca = PCA(n_components=n_components)
        X_reduced = self.pca.fit_transform(X)
        
        variance_explained = self.pca.explained_variance_ratio_
        
        return X_reduced, variance_explained
    
    def reduce_dimensions_tsne(self, X, n_components=2, perplexity=30, random_state=42):
        """Reduce dimensions using t-SNE for visualization."""
        tsne = TSNE(n_components=n_components, perplexity=perplexity, 
                    random_state=random_state, n_iter=1000)
        X_reduced = tsne.fit_transform(X)
        
        return X_reduced
    
    def prepare_for_clustering(self, df, exclude_cols=None):
        """Complete preprocessing pipeline for clustering."""
        if exclude_cols is None:
            exclude_cols = ['CustomerID', 'ClusterID', 'ClusterLabel']
        
        # Store customer IDs
        customer_ids = df['CustomerID'].values if 'CustomerID' in df.columns else None
        
        # Remove excluded columns
        df_clean = df.copy()
        for col in exclude_cols:
            if col in df_clean.columns:
                df_clean = df_clean.drop(columns=[col])
        
        # Handle missing values
        df_clean = self.handle_missing_values(df_clean)
        
        # Encode categorical
        df_clean = self.encode_categorical(df_clean)
        
        # Standardize
        df_scaled, feature_cols = self.standardize_features(df_clean)
        
        return df_scaled[feature_cols].values, feature_cols, customer_ids
    
    def save_preprocessor(self, filepath='preprocessor.pkl'):
        """Save the fitted preprocessor."""
        joblib.dump(self, filepath)
    
    @staticmethod
    def load_preprocessor(filepath='preprocessor.pkl'):
        """Load a saved preprocessor."""
        return joblib.load(filepath)
