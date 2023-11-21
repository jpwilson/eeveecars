import React from "react";
import { useParams } from "react-router-dom";
import useCarDetail from "../hooks/useCarDetails";

const CarDetails = () => {
  const { id } = useParams();
  const { car, error, isLoading } = useCarDetail(id);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!car) return <div>Car not found.</div>;

  return (
    <div>
      <img src={car.image_url} alt={car.model} />
      <h1>
        {car.make_name} {car.model} {car.submodel}
      </h1>
      <p>Acceleration 0-60: {car.acceleration_0_60} seconds</p>
      <p>Range: {car.epa_range} miles</p>
      <p>Top Speed: {car.top_speed} mph</p>
      <p>Price: ${car.current_price}</p>
    </div>
  );
};

export default CarDetails;
