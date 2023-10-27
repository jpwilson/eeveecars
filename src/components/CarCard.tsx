import { Card, CardBody, Heading, Image } from "@chakra-ui/react";
import { Car } from "../hooks/useCars";

interface Props {
  car: Car;
}

const CarCard = ({ car }: Props) => {
  return (
    <Card borderRadius={10} overflow={"hidden"}>
      <Image src={car.image_url}></Image>
      <CardBody>
        <Heading fontSize={"2xl"}>
          {car.make} {car.model}
          {car.submodel && car.submodel !== "N/A" ? `${car.submodel}` : ""} v-
          {car.generation}
        </Heading>
      </CardBody>
    </Card>
  );
};

export default CarCard;
