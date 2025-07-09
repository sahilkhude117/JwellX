import axios , {
    AxiosError,
    AxiosRequestConfig,
    AxiosResponse,
    isAxiosError
} from 'axios'
import qs from 'qs'
import { ErrorCode } from './types/error';

export const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api` || 'http://localhost:3000/api';

function isUrlRelative(url: string) {
    return !url.startsWith('http') && !url.startsWith('https');
}

function globalErrorHandler(error: AxiosError) {
    if (api.isError(error)) {
        const errorCode: ErrorCode | undefined = (
            error.response?.data as { code: ErrorCode }
        )?.code;
        if (
            errorCode === ErrorCode.SESSION_EXPIRED ||
            errorCode === ErrorCode.INVALID_BEARER_TOKEN
        ) {
            //log out the user
            console.log(errorCode);
            window.location.href = '/login';
        }
    }
}

function request<TResponse>(
    url: string,
    config: AxiosRequestConfig = {}
): Promise<TResponse> {
    const resolvedUrl = !isUrlRelative(url) ? url : `${API_BASE_URL}${url}`;
    return axios({
        url: resolvedUrl,
        ...config,
        headers: {
            ...config.headers
        }
    })
    .then((response) =>
        config.responseType === 'blob'
        ? response.data
        : response.data as TResponse
    )
    .catch((error) => {
        if (isAxiosError(error)) {
            globalErrorHandler(error)
        }
        throw error;
    });
}

export type HttpError = AxiosError<unknown, AxiosResponse<unknown>>;

export const api = {
    isError(error: unknown): error is HttpError {
        return isAxiosError(error);
    },
    get: <TResponse>(url: string, query?: unknown, config?: AxiosRequestConfig) =>
        request<TResponse>(url, {
          params: query,
          paramsSerializer: (params) => {
            return qs.stringify(params, {
              arrayFormat: 'repeat',
            });
          },
          ...config,
        }),
    delete: <TResponse>(
        url: string,
        query?: Record<string, string>,
        body?: unknown,
        ) =>
        request<TResponse>(url, {
            method: 'DELETE',
            params: query,
            data: body,
            paramsSerializer: (params) => {
            return qs.stringify(params, {
                arrayFormat: 'repeat',
            });
            },
        }),
    post: <TResponse, TBody = unknown, TParams = unknown>(
        url: string,
        body?: TBody,
        params?: TParams,
        headers?: Record<string, string>,
        ) =>
        request<TResponse>(url, {
            method: 'POST',
            data: body,
            headers: { 'Content-Type': 'application/json', ...headers },
            params: params,
        }),
    patch: <TResponse, TBody = unknown, TParams = unknown>(
        url: string,
        body?: TBody,
        params?: TParams,
        ) =>
        request<TResponse>(url, {
            method: 'PATCH',
            data: body,
            headers: { 'Content-Type': 'application/json' },
            params: params,
        }),
}









