import { useEffect, useState } from "react";
import apiClient from "../services/api-client";
import { CanceledError } from "axios";



  interface FetchResponse<T> {
    count: number;
    results: T[];
  }

const useData = <T>(endpoint: string) => {
    const [data, setData] = useState<T[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setLoading] = useState(false);
  
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);

      apiClient
        .get<FetchResponse<T>>(endpoint, {signal: controller.signal,headers: {
          'Content-Type': 'application/json',
          "access_token_ev_lineup": import.meta.env.VITE_API_SECRET_KEY as string,  // Securely use the environment variable
        }})
        .then((res) => {
          setData(res.data as unknown as T[]);
          setLoading(false);
          })
        .catch((err) => {
            if (err instanceof CanceledError) return;
            setError(err.message);
            setLoading(false);
          });
    
        return () => controller.abort();
    }, []);

    return {data, error, isLoading}
}

export default useData;