const API_BASE_URL = "https://customer-segmentation-ml-89q6.onrender.com";

export const predictCustomer = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.json();
};
