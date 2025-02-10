

export function backendUrl(address) {
  return import.meta.env.VITE_BACKEND_SERVER_URL + address;
}