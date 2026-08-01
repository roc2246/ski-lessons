export function getRequiredAuthToken(errorMessage = "No auth token provided"): string {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(errorMessage);
  }

  return token;
}