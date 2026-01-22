from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import sys

from preprocessing import DataPreprocessor
from clustering import CustomerSegmentation
from visualization import ClusterVisualizer

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global objects
preprocessor = DataPreprocessor()
segmentation = CustomerSegmentation()
visualizer = ClusterVisualizer()

# File paths
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
MODELS_DIR = os.path.join(DATA_DIR, 'models')
os.makedirs(MODELS_DIR, exist_ok=True)




@app.route("/")
def home():
    return {
        "status": "Backend is running",
        "message": "Customer Segmentation API is live"
    }



@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'ML Clustering Service'}), 200

@app.route('/api/elbow', methods=['POST'])
def compute_elbow():
    """Compute elbow method for K-Means."""
    try:
        data = request.json
        customers_data = data.get('customers', [])
        k_min = data.get('k_min', 2)
        k_max = data.get('k_max', 11)
        
        if not customers_data:
            return jsonify({'error': 'No customer data provided'}), 400
        
        # Preprocess data
        df = pd.DataFrame(customers_data)
        X, feature_names, customer_ids = preprocessor.prepare_for_clustering(df)
        
        # Compute elbow
        elbow_data = segmentation.elbow_method(X, k_range=range(k_min, k_max))
        
        # Generate visualization
        elbow_plot = visualizer.plot_elbow_curve(elbow_data)
        
        return jsonify({
            'elbow_data': elbow_data,
            'elbow_plot': elbow_plot,
            'feature_names': feature_names
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cluster', methods=['POST'])
def perform_clustering():
    """Perform clustering analysis."""
    try:
        data = request.json
        customers_data = data.get('customers', [])
        algorithm = data.get('algorithm', 'kmeans')
        params = data.get('params', {})
        
        if not customers_data:
            return jsonify({'error': 'No customer data provided'}), 400
        
        # Preprocess data
        df = pd.DataFrame(customers_data)
        X, feature_names, customer_ids = preprocessor.prepare_for_clustering(df)
        
        # Perform clustering based on algorithm
        if algorithm == 'kmeans':
            n_clusters = params.get('n_clusters', 5)
            labels = segmentation.fit_kmeans(X, n_clusters=n_clusters)
        elif algorithm == 'hierarchical':
            n_clusters = params.get('n_clusters', 5)
            linkage = params.get('linkage', 'ward')
            labels = segmentation.fit_hierarchical(X, n_clusters=n_clusters, linkage=linkage)
        elif algorithm == 'dbscan':
            eps = params.get('eps', 0.5)
            min_samples = params.get('min_samples', 5)
            labels = segmentation.fit_dbscan(X, eps=eps, min_samples=min_samples)
        else:
            return jsonify({'error': f'Unknown algorithm: {algorithm}'}), 400
        
        # Profile clusters
        profiles_df = segmentation.profile_clusters(X, feature_names)
        
        # Dimensionality reduction for visualization
        X_pca, variance_explained = preprocessor.reduce_dimensions_pca(X, n_components=2)
        
        # Generate visualizations
        plots = visualizer.generate_summary_plots(
            X, labels, feature_names, 
            X_reduced=X_pca, 
            profiles_df=profiles_df
        )
        
        # Prepare response
        result_df = df.copy()
        result_df['ClusterID'] = labels.astype(int)
        
        # Map cluster labels
        label_mapping = dict(zip(profiles_df['ClusterID'], profiles_df['Label']))
        result_df['ClusterLabel'] = result_df['ClusterID'].map(label_mapping)
        result_df['ClusterLabel'] = result_df['ClusterLabel'].fillna('Noise')
        
        response = {
            'algorithm': algorithm,
            'metrics': segmentation.metrics,
            'cluster_profiles': profiles_df.to_dict('records'),
            'customers_with_clusters': result_df.to_dict('records'),
            'visualizations': plots,
            'feature_names': feature_names,
            'pca_variance_explained': variance_explained.tolist(),
            'n_clusters': len(set(labels)) - (1 if -1 in labels else 0)
        }
        
        # Save model
        model_path = os.path.join(MODELS_DIR, f'{algorithm}_model.pkl')
        segmentation.save_model(model_path)
        
        preprocessor_path = os.path.join(MODELS_DIR, 'preprocessor.pkl')
        preprocessor.save_preprocessor(preprocessor_path)
        
        return jsonify(response), 200
        
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/predict', methods=['POST'])
def predict_cluster():
    """Predict cluster for new customer data."""
    try:
        data = request.json
        customer_data = data.get('customer', {})
        algorithm = data.get('algorithm', 'kmeans')
        
        if not customer_data:
            return jsonify({'error': 'No customer data provided'}), 400
        
        # Load model
        model_path = os.path.join(MODELS_DIR, f'{algorithm}_model.pkl')
        if not os.path.exists(model_path):
            return jsonify({'error': 'Model not found. Please train first.'}), 404
        
        segmentation_loaded = CustomerSegmentation.load_model(model_path)
        preprocessor_loaded = DataPreprocessor.load_preprocessor(
            os.path.join(MODELS_DIR, 'preprocessor.pkl')
        )
        
        # Preprocess new data
        df = pd.DataFrame([customer_data])
        X, _, _ = preprocessor_loaded.prepare_for_clustering(df)
        
        # Predict
        predicted_label = segmentation_loaded.predict_cluster(X)
        
        return jsonify({
            'predicted_cluster': int(predicted_label[0]),
            'customer': customer_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/visualizations', methods=['POST'])
def generate_visualizations():
    """Generate visualizations for existing cluster results."""
    try:
        data = request.json
        customers_data = data.get('customers', [])
        
        if not customers_data:
            return jsonify({'error': 'No customer data provided'}), 400
        
        df = pd.DataFrame(customers_data)
        
        if 'ClusterID' not in df.columns:
            return jsonify({'error': 'Customers must have ClusterID assigned'}), 400
        
        # Extract features (exclude ID and cluster columns)
        exclude_cols = ['CustomerID', 'ClusterID', 'ClusterLabel', '_id']
        feature_cols = [col for col in df.columns if col not in exclude_cols]
        
        X = df[feature_cols].values
        labels = df['ClusterID'].values
        
        # Dimensionality reduction
        prep = DataPreprocessor()
        X_pca, _ = prep.reduce_dimensions_pca(X, n_components=2)
        
        # Generate plots
        plots = {
            'clusters_2d': visualizer.plot_clusters_2d(X_pca, labels, "Customer Segments"),
            'feature_distributions': visualizer.plot_feature_distributions(
                pd.DataFrame(X, columns=feature_cols), feature_cols, labels
            ),
            'correlation_heatmap': visualizer.plot_correlation_heatmap(
                pd.DataFrame(X, columns=feature_cols), feature_cols
            )
        }
        
        return jsonify({'visualizations': plots}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sample-data', methods=['GET'])
def get_sample_data():
    """Generate sample Mall Customers dataset."""
    try:
        # Create sample data similar to Mall Customers dataset
        np.random.seed(42)
        n_samples = 200
        
        customer_ids = list(range(1, n_samples + 1))
        genders = np.random.choice(['Male', 'Female'], n_samples)
        ages = np.random.randint(18, 70, n_samples)
        annual_incomes = np.random.randint(15, 140, n_samples)  # in thousands
        spending_scores = np.random.randint(1, 100, n_samples)
        
        # Create some correlation between income and spending
        for i in range(n_samples):
            if annual_incomes[i] > 80:
                spending_scores[i] = np.random.randint(60, 100)
            elif annual_incomes[i] < 40:
                spending_scores[i] = np.random.randint(1, 40)
        
        sample_df = pd.DataFrame({
            'CustomerID': customer_ids,
            'Gender': genders,
            'Age': ages,
            'AnnualIncome': annual_incomes,
            'SpendingScore': spending_scores
        })
        
        return jsonify({
            'customers': sample_df.to_dict('records'),
            'count': len(sample_df)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting ML Clustering Service...")
    print(f"Models directory: {MODELS_DIR}")
    app.run(host='0.0.0.0', port=5001, debug=True)
