import os
import glob
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from skl2onnx import to_onnx

def main():
    print("Gathering data from CSV files...")
    
    # Update this path if running in Google Colab (e.g., '/content/data/*.csv')
    data_path = "data/*.csv" 
    all_files = glob.glob(data_path)
    
    if not all_files:
        print("No CSV files found in the data directory!")
        return
        
    df_list = []
    for filename in all_files:
        df = pd.read_csv(filename)
        df_list.append(df)
        
    # Combine all data into one DataFrame
    full_data = pd.concat(df_list, axis=0, ignore_index=True)
    
    # Drop empty rows just in case
    full_data.dropna(subset=['description', 'category'], inplace=True)
    
    X = full_data['description'].astype(str).values
    y = full_data['category'].astype(str).values
    
    print(f"Total training samples: {len(X)}")
    print("Training the Machine Learning Pipeline...")
    
    # Create the Scikit-Learn Pipeline
    # We use TF-IDF for text vectorization and Logistic Regression for classification
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=5000)),
        ('classifier', LogisticRegression(C=1.0, class_weight='balanced', max_iter=500))
    ])
    
    # Train the model
    pipeline.fit(X, y)
    print("Training complete! Accuracy on training data:", pipeline.score(X, y))
    
    print("Converting model to ONNX format...")
    # Convert to ONNX format
    # We define the initial input type (a single string/text)
    from skl2onnx.common.data_types import StringTensorType
    initial_type = [('input_text', StringTensorType([None, 1]))]
    
    onnx_model = to_onnx(pipeline, initial_types=initial_type, target_opset=12)
    
    # Save the ONNX file
    output_filename = "expense_model.onnx"
    with open(output_filename, "wb") as f:
        f.write(onnx_model.SerializeToString())
        
    print(f"Success! Model saved to {output_filename}")
    print("You can now move this file into your React app's public/ folder.")

if __name__ == "__main__":
    main()
