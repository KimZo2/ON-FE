export function handleApiResponse(response) {
  const { isSuccess, data, error } = response.data;

  if (!isSuccess) {
    const apiError = new Error(error?.message || "API Error");

    apiError.code = error?.code;     
    apiError.type = "BUSINESS";      
    apiError.raw = error;

    throw apiError;
  }

  return data;
}
