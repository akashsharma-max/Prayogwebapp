import loadingSpinner from './loadingSpinner';

const API_BASE_URL = 'https://sandbox-apis.prayog.io';

export class ApiError extends Error {
    constructor(message: string, public status: number, public data: any) {
        super(message);
        this.name = 'ApiError';
    }
}

const getAuthHeaders = (): Record<string, string> => {
    try {
        const authDataString = localStorage.getItem('authData');
        if (authDataString) {
            const authData = JSON.parse(authDataString);
            const token = authData?.id_token;
            if (token) {
                return { 'Authorization': `Bearer ${token}` };
            }
        }
    } catch (error) {
        console.error("Failed to parse auth data:", error);
    }
    return {};
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        if (response.status === 401) {
            window.dispatchEvent(new Event('auth:session-expired'));
        }

        let errorMessage = `API request failed with status ${response.status}`;
        let errorData = null;
        try {
            errorData = await response.json();
            if (errorData && errorData.message) {
                errorMessage = errorData.message;
            }
        } catch (jsonError) {
            // Body might not be JSON or might be empty.
        }
        throw new ApiError(errorMessage, response.status, errorData);
    }
    // Handle cases where the response body might be empty
    const text = await response.text();
    return text ? JSON.parse(text) : {};
};

const apiClient = {
    get: async (endpoint: string, params?: URLSearchParams) => {
        loadingSpinner.show();
        try {
            const url = new URL(`${API_BASE_URL}${endpoint}`);
            if (params) {
                url.search = params.toString();
            }
            
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
            });
            return await handleResponse(response);
        } finally {
            loadingSpinner.hide();
        }
    },

    post: async (endpoint: string, body: any) => {
        loadingSpinner.show();
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            return await handleResponse(response);
        } finally {
            loadingSpinner.hide();
        }
    },

    upload: async (endpoint: string, formData: FormData) => {
        loadingSpinner.show();
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    // Content-Type header is not set manually for FormData to allow the browser to set the boundary
                },
                body: formData,
            });
            return await handleResponse(response);
        } finally {
            loadingSpinner.hide();
        }
    },
};

export default apiClient;