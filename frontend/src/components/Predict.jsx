import { useState } from "react";
import { predictCustomer } from "../api";

export default function Predict() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handlePredict = async () => {
    try {
      const customer = {
        "Annual Income (k$)": 120,
        "Spending Score (1-100)": 65,
        Age: 35,
        Gender: "Male",
      };

      const res = await predictCustomer(customer);
      setResult(res);
      setError("");
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  return (
    <div>
      <button onClick={handlePredict}>Predict Customer Segment</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <pre style={{ background: "#eee", padding: "10px" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
