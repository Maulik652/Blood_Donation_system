export const environment = {
  production: true,
  apiUrl: (window as { __env?: { apiUrl?: string } }).__env?.apiUrl || '/api'
};
