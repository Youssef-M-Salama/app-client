import axios from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
  // Use environment variable for API URL or default to hosted URL
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://waffer.runasp.net',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token rotation
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Make request to get new token (using base axios to avoid interceptor loop)
        const res = await axios.post(`${apiClient.defaults.baseURL}/api/v1/auth/refresh`, {
          refreshToken
        });

        // If successful, save new tokens.
        // The refresh endpoint also wraps its response in the standard envelope:
        // { success, message, data: { token, refreshToken, ... } }
        if (res.data) {
          const payload = res.data?.data || res.data; // unwrap envelope
          const newToken = payload.token || payload.accessToken;
          const newRefreshToken = payload.refreshToken;

          if (newToken) {
            Cookies.set('accessToken', newToken);
            if (newRefreshToken) Cookies.set('refreshToken', newRefreshToken);

            // Update the original request with new token and retry
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');

        // Only redirect if we're in the browser environment
        if (typeof window !== 'undefined') {
          // Adjust this route based on your app's structure (e.g., /auth/login)
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Format error for the UI components
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      let appMessage = data?.message || 'حدث خطأ غير متوقع.';
      let validationErrors = null;

      if (status === 400) {
        // The backend wraps validation errors inside the envelope:
        // { error: { details: { errors: { FieldName: ["message"] } } } }
        // Try multiple known paths to extract field errors:
        const errors =
          data?.error?.details?.errors ||   // FluentValidation envelope path
          data?.errors ||                    // ASP.NET ModelState path
          null;

        if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
          appMessage = data?.message || 'يرجى مراجعة الأخطاء أدناه.';
          validationErrors = errors;
        } else {
          appMessage = data?.message || data?.error?.message || 'خطأ في التحقق من البيانات.';
        }
      } else if (status === 401) {
        appMessage = data?.message || 'بيانات الدخول غير صحيحة أو الجلسة انتهت.';
      } else if (status === 403) {
        appMessage = data?.message || 'ليس لديك صلاحية لتنفيذ هذا الإجراء. قد يحتاج حسابك إلى موافقة الإدارة.';
      } else if (status === 404) {
        appMessage = data?.message || 'المورد المطلوب غير موجود.';
      } else if (status === 409) {
        appMessage = data?.message || 'حدث تعارض (مثل: البريد الإلكتروني أو اسم المستخدم موجود مسبقاً).';
      } else if (status === 422) {
        appMessage = data?.message || 'لا يمكن تنفيذ هذا الإجراء في الحالة الحالية.';
      } else if (status >= 500) {
        appMessage = 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.';
      }

      // Attach parsed info to the error object so UI components can easily use it
      error.appMessage = appMessage;
      error.validationErrors = validationErrors;
      error.apiStatus = status;
    } else if (error.request) {
      // The request was made but no response was received
      error.appMessage = 'خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت.';
    } else {
      // Something happened in setting up the request
      error.appMessage = error.message;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
