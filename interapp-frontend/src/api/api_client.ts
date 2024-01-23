import axios, { AxiosInstance } from 'axios';

export interface APIClientConfig {
  useMultiPart?: boolean;
}

export class APIClient {
  private readonly isReactServerComponent: boolean = typeof window === 'undefined';
  public readonly instance: AxiosInstance;
  private readonly config: APIClientConfig;
  private abortController: AbortController | null = this.isReactServerComponent
    ? null
    : new AbortController();
  public constructor(config?: APIClientConfig) {
    const defaults: APIClientConfig = {
      useMultiPart: false,
    };
    this.config = { ...defaults, ...config };

    this.instance = axios.create({
      timeout: 60000,
      withCredentials: true,
      signal: this.abortController?.signal,
      validateStatus: (status) => {
        return status !== 429 && status < 500;
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      proxy: false,
      baseURL: this.isReactServerComponent
        ? `http://${process.env.NEXT_PUBLIC_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/api`
        : process.env.NEXT_PUBLIC_AXIOS_BASE_URL,
    });
    this.instance.interceptors.request.use((req) => {
      if (
        !this.isReactServerComponent &&
        window.location.pathname === '/error/429' &&
        this.abortController
      ) {
        this.abortController.abort('Too many requests');
      }
      if (this.config.useMultiPart) req.headers['Content-Type'] = 'multipart/form-data';
      else req.headers['Content-Type'] = 'application/json';

      if (this.config.useClient) {
        const token = localStorage.getItem('access_token');
        if (token) {
          req.headers['Authorization'] = `Bearer ${token}`;
        }
      }
      return req;
    });
    this.instance.interceptors.response.use(
      (res) => res,
      (err) => {
        const statusCode: number = err.response.status;
        if (statusCode === 429) {
          window.location.href = '/error/429';
        }
        throw err;
      },
    );
  }
}

export default APIClient;
