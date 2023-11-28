import { AccountDetails, LogInDetails, UserWithJWT } from '@/providers/AuthProvider/types';
import axios, { AxiosInstance } from 'axios';

export class APIClient {
  public readonly instance: AxiosInstance;
  public constructor(baseUrl: string) {
    this.instance = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      withCredentials: true,
      validateStatus: (status) => status < 500,
    });
    this.instance.interceptors.request.use((req) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        req.headers['Authorization'] = `Bearer ${token}`;
      }
      req.headers['Content-Type'] = 'application/json';
      return req;
    });
  }
  public signUp = async (accountDetails: AccountDetails) => {
    // returns 204 No Content
    const res = await this.instance.post('/api/auth/signup', JSON.stringify(accountDetails));
    return res.status;
  };
  public signIn = async (details: LogInDetails) => {
    const response = await this.instance.post('/api/auth/signin', JSON.stringify(details));
    return { data: response.data as UserWithJWT, status: response.status };
  };
  public signOut = async () => {
    // returns 204 No Content
    const res = await this.instance.delete('/api/auth/signout');

    return res.status;
  };
  public refreshAccessToken = async () => {
    const response = await this.instance.post('/api/auth/refresh');
    return response.data as Omit<UserWithJWT, 'user'>;
  };
}

const axiosClient = new APIClient(process.env.AXIOS_BASE_URL as string);

export default axiosClient;
