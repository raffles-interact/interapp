import axios, { AxiosInstance } from 'axios';

export interface APIClientConfig {
  useClient?: boolean;
  useMultiPart?: boolean;
}

export class APIClient {
  public readonly instance: AxiosInstance;
  private readonly config: APIClientConfig;
  public constructor(config?: APIClientConfig) {
    const defaults: APIClientConfig = {
      useClient: true,
      useMultiPart: false,
    };
    this.config = { ...defaults, ...config };
    this.instance = axios.create({
      timeout: 60000,
      withCredentials: true,
      validateStatus: (status) => status < 500,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      proxy: false,
      baseURL: this.config.useClient
        ? process.env.NEXT_PUBLIC_AXIOS_BASE_URL
        : `http://${process.env.BACKEND_HOST}:${process.env.BACKEND_PORT}/api`,
    });
    this.instance.interceptors.request.use((req) => {
      if (this.config.useMultiPart) req.headers['Content-Type'] = 'multipart/form-data';
      else req.headers['Content-Type'] = 'application/json';
      return req;
    });
    if (this.config.useClient) {
      this.instance.interceptors.request.use((req) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          req.headers['Authorization'] = `Bearer ${token}`;
        }
        return req;
      });
    }
  }
}

export default APIClient;
