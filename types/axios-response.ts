export interface AxiosResponseTypeWithoutPagination<T> {
    status: "success" | "error";
    message: string;
    data: T;
}

export interface AxiosResponseTypeWithPagination<T> {
    status: "success" | "error";
    message: string;
    data: {
        results: T;
        page: number;
        limit: number;
        totalResults: number;
        totalPages: number;
    };
}

export interface AxiosErrorResponseType<T> {
    status: "error";
    message: string;
    data?: T;
}