import axios, { CanceledError } from "axios";
import { useEffect, useState } from "react";
import apiClient from "../services/api-client";


export interface Car {
    make_name: string;
    model: string;
    submodel: string;
    generation: string;
    image_url: string;
    trim_first_released: string;
    carmodel_first_released: string;
    current_price: number;
    customer_and_critic_rating: number;
    range_combined_mid: number;
  }
  
  interface FetchCarsResponse {
    count: number;
    results: Car[];
  }

const useCars = () => {
    const [cars, setCars] = useState<Car[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setLoading] = useState(false);
  
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);

      apiClient
        .get<FetchCarsResponse>("/cars", {signal: controller.signal})
        .then((res) => {
          setCars(res.data);
          setLoading(false);
          })
        .catch((err) => {
            if (err instanceof CanceledError) return;
            setError(err.message);
            setLoading(false);
          });
    
        return () => controller.abort();
    }, []);

    return {cars, error, isLoading}
}

export default useCars;