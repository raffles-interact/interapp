import { AccountDetails, LogInDetails, UserWithJWT } from '@/providers/AuthProvider/types';
import axios, { AxiosInstance } from 'axios';

export class APIClient {
  public readonly instance: AxiosInstance;
  public constructor(baseUrl: string) {
    this.instance = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      withCredentials: true,
    });
    this.instance.interceptors.request.use(
      (req) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(req);
        }
        const token = localStorage.getItem('accessToken');
        if (token) {
          req.headers['Authorization'] = `Bearer ${token}`;
        }
        req.headers['Content-Type'] = 'application/json';
        return req;
      },
      (err) => {
        if (process.env.NODE_ENV === 'development') {
          console.error(err);
        }
        return Promise.reject(err);
      },
    );
    this.instance.interceptors.response.use(
      (res) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(res);
        }
        return res;
      },
      (err) => {
        if (process.env.NODE_ENV === 'development') {
          console.error(err);
        }
        return Promise.reject(err);
      },
    );
  }
  public signUp = async (accountDetails: AccountDetails): Promise<void> => {
    // returns 204 No Content
    await this.instance.post('/api/auth/signup', JSON.stringify(accountDetails));
  };
  public signIn = async (details: LogInDetails) => {
    const response = await this.instance.post('/api/auth/signin', JSON.stringify(details));
    return response.data as UserWithJWT;
  };
  public signOut = async (): Promise<void> => {
    // returns 204 No Content
    await this.instance.delete('/api/auth/signout');
  };
  public refreshAccessToken = async () => {
    const response = await this.instance.post('/api/auth/refresh');
    return response.data as Omit<UserWithJWT, 'user'>;
  };
}

const axiosClient = new APIClient(process.env.AXIOS_BASE_URL as string);

export default axiosClient;
