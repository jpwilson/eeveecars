import axios, { CanceledError } from "axios";
import { useEffect, useState } from "react";
import apiClient from "../../services/api-client";


interface Car {
    make: string;
    model: string;
    submodel: string;
    generation: string;
    image_url: string;
    trim_first_released: string;
    carmodel_first_released: string;
    current_price: number;
  }
  
  interface FetchCarsResponse {
    count: number;
    results: Car[];
  }

const useCars = () => {
    const [cars, setCars] = useState<Car[]>([]);
    const [error, setError] = useState("");
  
    useEffect(() => {
        const controller = new AbortController();

      apiClient
        .get<FetchCarsResponse>("/cars", {signal: controller.signal})
        .then((res) => setCars(res.data))
        .catch((err) => {
            if (err instanceof CanceledError) return;
            setError(err.message)});
    
        return () => controller.abort();
    }, []);

    return {cars, error}
}

export default useCars;