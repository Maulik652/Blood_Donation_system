export const environment = {
  production: false,
  apiUrl: (window as { __env?: { apiUrl?: string } }).__env?.apiUrl || 'http://localhost:5000/api'
};
