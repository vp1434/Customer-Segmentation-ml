import { useState } from "react";
import { predictCustomer } from "../api";

const Predict = () => {
  const [result, setResult] = useState(null);

  const handlePredict = async () => {
    const data = {
      features: [12000, 3, 2, 45], // demo input
    };

    try {
      const res = await predictCustomer(data);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Backend error (later fix kar lenge)");
    }
  };

  return (
    <div>
      <button onClick={handlePredict}>Predict Customer</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
};

export default Predict;
