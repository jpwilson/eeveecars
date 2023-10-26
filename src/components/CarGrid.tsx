import { Text } from "@chakra-ui/react";
import useCars from "./hooks/useCars";

const CarGrid = () => {
  const { cars, error } = useCars();
  return (
    <>
      {error && <Text>{error}</Text>}
      <ul>
        {cars.map((car) => (
          <li key={car.id}>
            {car.make} -- {car.model} {car.submodel} id: {car.id}{" "}
          </li>
        ))}
      </ul>
    </>
  );
};

export default CarGrid;
