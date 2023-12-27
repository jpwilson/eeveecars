import { MdElectricCar } from "react-icons/md";
import { Card, CardBody, HStack, Heading, Icon, Image } from "@chakra-ui/react";
import { Car } from "../hooks/useCars";
import CarScore from "./CarScore";
import CarCardContainer from "./CarCardContainer";
import { Link } from "react-router-dom";

interface Props {
  car: Car;
}

const CarCard = ({ car }: Props) => {
  return (
    <Card>
      <Image
        src={car.image_url}
        height="200px"
        width="full"
        objectFit="cover"
      ></Image>
      <CardBody>
        <Heading fontSize={"2xl"}>
          <Link to={`model_detail/${car.make_model_slug}`}>
            {car.make_name} {car.model}
          </Link>
        </Heading>
        <HStack justifyContent="space-between" padding="10px">
          <p>
            <Icon as={MdElectricCar} boxSize={8} />
            {car.epa_range}
          </p>
          {/* <CarScore score={car.customer_and_critic_rating} /> */}
          <CarScore score={car.average_rating} />
        </HStack>
      </CardBody>
    </Card>
  );
};

export default CarCard;
