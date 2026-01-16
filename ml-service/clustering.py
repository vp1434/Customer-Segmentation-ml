import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, AgglomerativeClustering, DBSCAN
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
import joblib
import warnings
warnings.filterwarnings('ignore')

class CustomerSegmentation:
    """Clustering algorithms for customer segmentation."""
    
    def __init__(self):
        self.model = None
        self.labels = None
        self.cluster_centers = None
        self.metrics = {}
        self.algorithm = None
        
    def elbow_method(self, X, k_range=range(2, 11)):
        """
        Compute inertia for different K values to find optimal K using elbow method.
        Returns dict with K values and corresponding inertia.
        """
        inertias = []
        silhouette_scores = []
        
        for k in k_range:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(X)
            inertias.append(kmeans.inertia_)
            
            # Compute silhouette score
            labels = kmeans.labels_
            sil_score = silhouette_score(X, labels)
            silhouette_scores.append(sil_score)
        
        return {
            'k_values': list(k_range),
            'inertias': inertias,
            'silhouette_scores': silhouette_scores
        }
    
    def fit_kmeans(self, X, n_clusters=5, random_state=42):
        """Fit K-Means clustering."""
        self.algorithm = 'kmeans'
        self.model = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
        self.labels = self.model.fit_predict(X)
        self.cluster_centers = self.model.cluster_centers_
        
        # Compute metrics
        self._compute_metrics(X)
        
        return self.labels
    
    def fit_hierarchical(self, X, n_clusters=5, linkage='ward'):
        """Fit Hierarchical (Agglomerative) clustering."""
        self.algorithm = 'hierarchical'
        self.model = AgglomerativeClustering(n_clusters=n_clusters, linkage=linkage)
        self.labels = self.model.fit_predict(X)
        
        # Compute cluster centers manually
        self.cluster_centers = np.array([X[self.labels == i].mean(axis=0) 
                                         for i in range(n_clusters)])
        
        # Compute metrics
        self._compute_metrics(X)
        
        return self.labels
    
    def fit_dbscan(self, X, eps=0.5, min_samples=5):
        """Fit DBSCAN clustering."""
        self.algorithm = 'dbscan'
        self.model = DBSCAN(eps=eps, min_samples=min_samples)
        self.labels = self.model.fit_predict(X)
        
        # DBSCAN can have noise points (label=-1)
        n_clusters = len(set(self.labels)) - (1 if -1 in self.labels else 0)
        
        if n_clusters > 0:
            # Compute cluster centers for non-noise points
            self.cluster_centers = np.array([X[self.labels == i].mean(axis=0) 
                                            for i in set(self.labels) if i != -1])
            
            # Compute metrics
            if n_clusters > 1:
                self._compute_metrics(X)
            else:
                self.metrics = {'error': 'Only one cluster found or all noise'}
        else:
            self.metrics = {'error': 'No clusters found, all points are noise'}
            self.cluster_centers = None
        
        return self.labels
    
    def _compute_metrics(self, X):
        """Compute clustering quality metrics."""
        # Only compute if we have at least 2 clusters
        n_clusters = len(set(self.labels)) - (1 if -1 in self.labels else 0)
        
        if n_clusters < 2:
            self.metrics = {
                'n_clusters': n_clusters,
                'error': 'Need at least 2 clusters for metrics'
            }
            return
        
        # Filter out noise points for DBSCAN
        mask = self.labels != -1
        X_filtered = X[mask]
        labels_filtered = self.labels[mask]
        
        try:
            self.metrics = {
                'n_clusters': n_clusters,
                'silhouette_score': float(silhouette_score(X_filtered, labels_filtered)),
                'davies_bouldin_score': float(davies_bouldin_score(X_filtered, labels_filtered)),
                'calinski_harabasz_score': float(calinski_harabasz_score(X_filtered, labels_filtered)),
                'n_samples': len(X),
                'n_noise_points': int((self.labels == -1).sum()) if self.algorithm == 'dbscan' else 0
            }
        except Exception as e:
            self.metrics = {'error': str(e)}
    
    def profile_clusters(self, X, feature_names, original_df=None):
        """
        Create profile for each cluster with mean/median values.
        Returns DataFrame with cluster statistics.
        """
        # Create DataFrame with features and labels
        df = pd.DataFrame(X, columns=feature_names)
        df['Cluster'] = self.labels
        
        # Exclude noise points for DBSCAN
        df_clean = df[df['Cluster'] != -1]
        
        # Compute statistics per cluster
        profiles = []
        
        for cluster_id in sorted(df_clean['Cluster'].unique()):
            cluster_data = df_clean[df_clean['Cluster'] == cluster_id]
            
            profile = {
                'ClusterID': int(cluster_id),
                'Size': len(cluster_data),
                'Percentage': round(len(cluster_data) / len(df_clean) * 100, 2)
            }
            
            # Add mean values for each feature
            for feature in feature_names:
                profile[f'{feature}_mean'] = round(cluster_data[feature].mean(), 2)
                profile[f'{feature}_median'] = round(cluster_data[feature].median(), 2)
            
            profiles.append(profile)
        
        profiles_df = pd.DataFrame(profiles)
        
        # Auto-label clusters based on characteristics
        profiles_df['Label'] = self._auto_label_clusters(profiles_df, feature_names)
        
        return profiles_df
    
    def _auto_label_clusters(self, profiles_df, feature_names):
        """Automatically generate meaningful labels for clusters."""
        labels = []
        
        # Check if we have income and spending features
        has_income = any('income' in f.lower() for f in feature_names)
        has_spending = any('spending' in f.lower() or 'monetary' in f.lower() for f in feature_names)
        
        for _, row in profiles_df.iterrows():
            if has_income and has_spending:
                # Find income and spending columns
                income_col = [f for f in profiles_df.columns if 'income' in f.lower() and 'mean' in f.lower()][0]
                spending_col = [f for f in profiles_df.columns if ('spending' in f.lower() or 'monetary' in f.lower()) and 'mean' in f.lower()][0]
                
                income_val = row[income_col]
                spending_val = row[spending_col]
                
                # Determine relative position
                all_income = profiles_df[income_col]
                all_spending = profiles_df[spending_col]
                
                income_percentile = (income_val > all_income).sum() / len(all_income)
                spending_percentile = (spending_val > all_spending).sum() / len(all_spending)
                
                # Create labels
                if income_percentile > 0.66 and spending_percentile > 0.66:
                    label = "Premium High Spenders"
                elif income_percentile > 0.66 and spending_percentile < 0.33:
                    label = "Affluent Savers"
                elif income_percentile < 0.33 and spending_percentile > 0.66:
                    label = "Budget Splurgers"
                elif income_percentile < 0.33 and spending_percentile < 0.33:
                    label = "Careful Shoppers"
                elif spending_percentile > 0.66:
                    label = "Active Shoppers"
                else:
                    label = "Average Customers"
            else:
                # Generic labeling based on cluster size
                if row['Percentage'] > 30:
                    label = "Mainstream Segment"
                elif row['Percentage'] < 10:
                    label = "Niche Segment"
                else:
                    label = f"Segment {chr(65 + int(row['ClusterID']))}"  # A, B, C, etc.
            
            labels.append(label)
        
        return labels
    
    def predict_cluster(self, X):
        """Predict cluster for new data points."""
        if self.model is None:
            raise ValueError("Model not fitted yet")
        
        if self.algorithm == 'kmeans':
            return self.model.predict(X)
        elif self.algorithm in ['hierarchical', 'dbscan']:
            # For algorithms without predict, find nearest cluster center
            if self.cluster_centers is None:
                raise ValueError("No cluster centers available")
            
            distances = np.linalg.norm(X[:, np.newaxis] - self.cluster_centers, axis=2)
            return np.argmin(distances, axis=1)
        else:
            raise ValueError(f"Unknown algorithm: {self.algorithm}")
    
    def save_model(self, filepath='clustering_model.pkl'):
        """Save the fitted model and metadata."""
        model_data = {
            'model': self.model,
            'algorithm': self.algorithm,
            'cluster_centers': self.cluster_centers,
            'metrics': self.metrics,
            'labels': self.labels
        }
        joblib.dump(model_data, filepath)
    
    @staticmethod
    def load_model(filepath='clustering_model.pkl'):
        """Load a saved model."""
        model_data = joblib.load(filepath)
        seg = CustomerSegmentation()
        seg.model = model_data['model']
        seg.algorithm = model_data['algorithm']
        seg.cluster_centers = model_data['cluster_centers']
        seg.metrics = model_data['metrics']
        seg.labels = model_data.get('labels')
        return seg
