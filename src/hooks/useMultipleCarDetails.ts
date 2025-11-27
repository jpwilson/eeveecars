import { useEffect, useState } from "react";
import apiClient from "../services/api-client";
import { CarDetails } from "./useCarDetails";

const useMultipleCarDetails = (carIds: number[]) => {
  const [data, setData] = useState<CarDetails[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (carIds.length === 0) {
      setData([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const fetchAllCars = async () => {
      try {
        const promises = carIds.map((id) =>
          apiClient.get<CarDetails>(`/cars/${id}`, {
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              [import.meta.env.VITE_API_SECRET_KEY_NAME]: import.meta.env
                .VITE_API_SECRET_KEY as string,
            },
          })
        );

        const responses = await Promise.all(promises);
        const carsData = responses.map((res) => res.data);
        setData(carsData);
        setError("");
      } catch (err: any) {
        if (err.name === "CanceledError") return;
        setError(err.message || "Failed to fetch car details");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCars();

    return () => controller.abort();
  }, [carIds.join(",")]);

  return { data, error, isLoading };
};

export default useMultipleCarDetails;
