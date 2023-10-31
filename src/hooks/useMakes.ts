import { useEffect, useState } from "react";
import apiClient from "../services/api-client";
import { CanceledError } from "axios";



export interface Make {
    name: string;
    ceo_pay?: number;
    headquarters?: string;
    founding_date?: string;
    market_cap?: number;
    revenue?: number;
    num_ev_model?: number;
    first_ev_model_date?: string;
    unionized?: boolean;
  }
  
  interface FetchMakesResponse {
    count: number;
    results: Make[];
  }

const useMakes = () => {
    const [makes, setMakes] = useState<Make[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setLoading] = useState(false);
  
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);

      apiClient
        .get<FetchMakesResponse>("/makes", {signal: controller.signal})
        .then((res) => {
          setMakes(res.data);
          setLoading(false);
          })
        .catch((err) => {
            if (err instanceof CanceledError) return;
            setError(err.message);
            setLoading(false);
          });
    
        return () => controller.abort();
    }, []);

    return {makes, error, isLoading}
}

export default useMakes;