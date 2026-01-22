const API_URL =
  "https://customer-segmentation-ml-89q6.onrender.com/api/predict";

export async function predictCustomer(customerData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer: customerData,
      algorithm: "kmeans",
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Prediction failed");
  }

  return response.json();
}
