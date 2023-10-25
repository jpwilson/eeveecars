import { useEffect } from "react";
import { useState } from "react";
import apiClient from "../services/api-client";
import axios from "axios";
import { Text } from "@chakra-ui/react";

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

const CarGrid = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get<FetchCarsResponse>("/carso")
      .then((res) => setCars(res.data))
      .catch((err) => setError(err.message));
  });
  return (
    <>
      {error && <Text>{error}</Text>}
      <ul>
        {cars.map((car) => (
          <li key={car.make}>
            {car.make} -- {car.model} {car.submodel}{" "}
          </li>
        ))}
      </ul>
    </>
  );
};

export default CarGrid;
