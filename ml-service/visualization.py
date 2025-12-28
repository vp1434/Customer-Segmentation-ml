import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd
from io import BytesIO
import base64

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['figure.dpi'] = 100

class ClusterVisualizer:
    """Generate visualizations for cluster analysis."""
    
    def __init__(self):
        self.colors = sns.color_palette("husl", 10)
    
    def plot_elbow_curve(self, elbow_data):
        """Plot elbow curve for K-Means."""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
        
        # Inertia plot
        k_values = elbow_data['k_values']
        inertias = elbow_data['inertias']
        
        ax1.plot(k_values, inertias, 'bo-', linewidth=2, markersize=8)
        ax1.set_xlabel('Number of Clusters (K)', fontsize=12)
        ax1.set_ylabel('Inertia (Within-cluster sum of squares)', fontsize=12)
        ax1.set_title('Elbow Method For Optimal K', fontsize=14, fontweight='bold')
        ax1.grid(True, alpha=0.3)
        
        # Silhouette score plot
        silhouette_scores = elbow_data['silhouette_scores']
        ax2.plot(k_values, silhouette_scores, 'ro-', linewidth=2, markersize=8)
        ax2.set_xlabel('Number of Clusters (K)', fontsize=12)
        ax2.set_ylabel('Silhouette Score', fontsize=12)
        ax2.set_title('Silhouette Score vs K', fontsize=14, fontweight='bold')
        ax2.grid(True, alpha=0.3)
        ax2.axhline(y=0.5, color='g', linestyle='--', alpha=0.5, label='Good threshold (0.5)')
        ax2.legend()
        
        plt.tight_layout()
        
        return self._fig_to_base64(fig)
    
    def plot_clusters_2d(self, X_reduced, labels, title="Cluster Visualization"):
        """Plot clusters in 2D space (after PCA/t-SNE)."""
        fig, ax = plt.subplots(figsize=(12, 8))
        
        unique_labels = set(labels)
        n_clusters = len(unique_labels) - (1 if -1 in unique_labels else 0)
        
        colors = sns.color_palette("husl", n_clusters)
        
        for idx, label in enumerate(sorted(unique_labels)):
            if label == -1:
                # Noise points (DBSCAN)
                color = 'gray'
                marker = 'x'
                label_text = 'Noise'
            else:
                color = colors[label]
                marker = 'o'
                label_text = f'Cluster {label}'
            
            mask = labels == label
            ax.scatter(X_reduced[mask, 0], X_reduced[mask, 1], 
                      c=[color], label=label_text, 
                      alpha=0.6, s=100, marker=marker, edgecolors='black', linewidth=0.5)
        
        ax.set_xlabel('Component 1', fontsize=12)
        ax.set_ylabel('Component 2', fontsize=12)
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        return self._fig_to_base64(fig)
    
    def plot_feature_distributions(self, df, feature_names, labels):
        """Plot distribution of features across clusters."""
        df_plot = df.copy()
        df_plot['Cluster'] = labels
        
        # Filter out noise
        df_plot = df_plot[df_plot['Cluster'] != -1]
        
        n_features = len(feature_names)
        n_cols = min(3, n_features)
        n_rows = (n_features + n_cols - 1) // n_cols
        
        fig, axes = plt.subplots(n_rows, n_cols, figsize=(15, n_rows * 4))
        axes = axes.flatten() if n_features > 1 else [axes]
        
        for idx, feature in enumerate(feature_names):
            ax = axes[idx]
            
            for cluster_id in sorted(df_plot['Cluster'].unique()):
                cluster_data = df_plot[df_plot['Cluster'] == cluster_id][feature]
                ax.hist(cluster_data, alpha=0.5, label=f'Cluster {cluster_id}', bins=20)
            
            ax.set_xlabel(feature, fontsize=10)
            ax.set_ylabel('Frequency', fontsize=10)
            ax.set_title(f'Distribution of {feature}', fontsize=11, fontweight='bold')
            ax.legend()
            ax.grid(True, alpha=0.3)
        
        # Hide extra subplots
        for idx in range(n_features, len(axes)):
            axes[idx].set_visible(False)
        
        plt.tight_layout()
        
        return self._fig_to_base64(fig)
    
    def plot_cluster_profiles(self, profiles_df, feature_names):
        """Plot cluster profiles with radar chart and bar charts."""
        n_clusters = len(profiles_df)
        
        # Get mean features
        mean_features = [col for col in profiles_df.columns if '_mean' in col]
        
        if len(mean_features) == 0:
            return None
        
        # Normalize values for better visualization
        feature_data = profiles_df[mean_features].values
        feature_data_norm = (feature_data - feature_data.min(axis=0)) / (feature_data.max(axis=0) - feature_data.min(axis=0) + 1e-10)
        
        fig, axes = plt.subplots(1, 2, figsize=(16, 6))
        
        # Bar chart
        ax1 = axes[0]
        x = np.arange(len(mean_features))
        width = 0.8 / n_clusters
        
        for idx, row_idx in enumerate(range(n_clusters)):
            offset = (idx - n_clusters/2) * width
            label = profiles_df.iloc[row_idx]['Label'] if 'Label' in profiles_df.columns else f'Cluster {idx}'
            ax1.bar(x + offset, feature_data_norm[row_idx], width, 
                   label=label, alpha=0.8)
        
        ax1.set_xlabel('Features', fontsize=12)
        ax1.set_ylabel('Normalized Value', fontsize=12)
        ax1.set_title('Cluster Profiles Comparison', fontsize=14, fontweight='bold')
        ax1.set_xticks(x)
        ax1.set_xticklabels([f.replace('_mean', '') for f in mean_features], rotation=45, ha='right')
        ax1.legend()
        ax1.grid(True, alpha=0.3, axis='y')
        
        # Cluster sizes
        ax2 = axes[1]
        labels_list = profiles_df['Label'].tolist() if 'Label' in profiles_df.columns else [f'Cluster {i}' for i in range(n_clusters)]
        sizes = profiles_df['Size'].tolist()
        
        colors = sns.color_palette("husl", n_clusters)
        wedges, texts, autotexts = ax2.pie(sizes, labels=labels_list, autopct='%1.1f%%',
                                             colors=colors, startangle=90)
        
        # Beautify text
        for text in texts:
            text.set_fontsize(10)
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
            autotext.set_fontsize(10)
        
        ax2.set_title('Cluster Size Distribution', fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        
        return self._fig_to_base64(fig)
    
    def plot_correlation_heatmap(self, df, feature_names):
        """Plot correlation heatmap of features."""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        corr = df[feature_names].corr()
        
        sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', 
                   center=0, square=True, ax=ax, cbar_kws={"shrink": 0.8})
        
        ax.set_title('Feature Correlation Heatmap', fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        
        return self._fig_to_base64(fig)
    
    def _fig_to_base64(self, fig):
        """Convert matplotlib figure to base64 string."""
        buf = BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)
        return img_base64
    
    def generate_summary_plots(self, X, labels, feature_names, X_reduced=None, 
                              elbow_data=None, profiles_df=None):
        """Generate all summary visualizations."""
        plots = {}
        
        # Convert to DataFrame
        df = pd.DataFrame(X, columns=feature_names)
        
        # Elbow curve (if provided)
        if elbow_data:
            plots['elbow_curve'] = self.plot_elbow_curve(elbow_data)
        
        # 2D cluster visualization
        if X_reduced is not None:
            plots['clusters_2d'] = self.plot_clusters_2d(X_reduced, labels, 
                                                         "Customer Segments (2D Projection)")
        
        # Feature distributions
        plots['feature_distributions'] = self.plot_feature_distributions(df, feature_names, labels)
        
        # Cluster profiles
        if profiles_df is not None:
            plots['cluster_profiles'] = self.plot_cluster_profiles(profiles_df, feature_names)
        
        # Correlation heatmap
        plots['correlation_heatmap'] = self.plot_correlation_heatmap(df, feature_names)
        
        return plots
