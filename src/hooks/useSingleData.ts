import { useEffect, useState } from "react";
import apiClient from "../services/api-client";
import { CanceledError } from "axios";



const useSingleData = <T>(endpoint: string) => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setLoading] = useState(false);
  
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);

      apiClient
        .get<T>(endpoint, { signal: controller.signal,headers: {
          'Content-Type': 'application/json',
          [import.meta.env.VITE_API_SECRET_KEY_NAME]: import.meta.env.VITE_API_SECRET_KEY as string,  // Securely use the environment variable
        } })
        .then((res) => {
          setData(res.data);
          setLoading(false);
        })
        .catch((err) => {
            if (err instanceof CanceledError) return;
            setError(err.message);
            setLoading(false);
        });
    
        return () => controller.abort();
    }, [endpoint]);

    return { data, error, isLoading };
}

export default useSingleData;