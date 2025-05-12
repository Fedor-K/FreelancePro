import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Пытаемся получить JSON ответ для более детальной информации об ошибке
      const contentType = res.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        
        // Обработка ошибок валидации или детальных сообщений от сервера
        if (errorData.error) {
          if (errorData.details && Array.isArray(errorData.details)) {
            // Выводим первую ошибку валидации, если они есть
            const validationErrorMessage = errorData.details[0]?.message || errorData.details[0] || '';
            throw new Error(`${errorData.error}: ${validationErrorMessage}`);
          }
          throw new Error(errorData.error);
        }
      }
      
      // Если не удалось получить JSON или в нем нет поля error
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
      
    } catch (e) {
      // Если произошла ошибка при обработке ответа
      if (e instanceof Error) {
        throw e; // Прокидываем уже созданную ошибку
      }
      
      // Запасной вариант, если не удалось получить детальную информацию об ошибке
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    if (error instanceof Error) {
      // Пробрасываем ошибку из throwIfResNotOk
      throw error;
    }
    
    // Для сетевых ошибок и других непредвиденных ситуаций
    console.error('Network or unexpected error:', error);
    throw new Error('Failed to connect to the server. Please check your network connection and try again.');
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      
      // Проверка на пустой ответ
      const text = await res.text();
      if (!text) {
        return null; // Возвращаем null для пустых ответов
      }
      
      try {
        return JSON.parse(text);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      // Для сетевых ошибок и других непредвиденных ситуаций
      console.error('Network or unexpected error in query:', error);
      throw new Error('Failed to connect to the server. Please check your network connection and try again.');
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
