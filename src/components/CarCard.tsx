import { MdElectricCar } from "react-icons/md";
import { Card, CardBody, HStack, Heading, Icon, Image } from "@chakra-ui/react";
import { Car } from "../hooks/useCars";
import CarScore from "./CarScore";

interface Props {
  car: Car;
}

const CarCard = ({ car }: Props) => {
  return (
    <Card width="300px" borderRadius={10} overflow={"hidden"}>
      <Image
        src={car.image_url}
        height="200px"
        width="full"
        objectFit="cover"
      ></Image>
      <CardBody>
        <Heading fontSize={"2xl"}>
          {car.make} {car.model}
          {car.submodel && car.submodel !== "N/A" ? `${car.submodel}` : ""} v-
          {car.generation}
        </Heading>
        <HStack justifyContent="space-between" padding="10px">
          <p>
            <Icon as={MdElectricCar} boxSize={8} />
            <nbsp /> {car.range_combined_mid}
          </p>
          <CarScore score={car.customer_and_critic_rating} />
        </HStack>
      </CardBody>
    </Card>
  );
};

export default CarCard;
