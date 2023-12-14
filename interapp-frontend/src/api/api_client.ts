import { AccountDetails, LogInDetails, UserWithJWT } from '@/providers/AuthProvider/types';
import axios, { AxiosInstance } from 'axios';

export interface APIClientConfig {
  useClient?: boolean;
}

export class APIClient {
  public readonly instance: AxiosInstance;
  private readonly config: APIClientConfig;
  public constructor(config?: APIClientConfig) {
    this.config = config ?? {
      useClient: true,
    };
    this.instance = axios.create({
      baseURL: process.env.AXIOS_BASE_URL as string,
      timeout: 10000,
      withCredentials: true,
      validateStatus: (status) => status < 500,
    });
    this.instance.interceptors.request.use((req) => {
      req.headers['Content-Type'] = 'application/json';
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
