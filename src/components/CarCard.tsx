import { MdElectricCar } from "react-icons/md";
import {
  Card,
  CardBody,
  VStack,
  HStack,
  Heading,
  Icon,
  Image,
  Text,
} from "@chakra-ui/react";
import { Car } from "../hooks/useCars";
import CarScore from "./CarScore";
import CarCardContainer from "./CarCardContainer";
import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";

interface Props {
  car: Car;
}

const CarCard = ({ car }: Props) => {
  return (
    <Card>
      <Link to={`model_detail/${car.make_model_slug}`}>
        <Image
          src={car.image_url}
          height="200px"
          width="full"
          objectFit="cover"
        ></Image>
        <CardBody>
          <Heading fontSize={"2xl"}>
            {car.make_name} {car.model}
          </Heading>
          <VStack justifyContent="space-between" padding="10px">
            <Text fontSize="xs" fontWeight="bold">
              Price est:
              {formatPrice(car.current_price)}
            </Text>
            <Text fontSize="xs" fontWeight="bold">
              Range: {car.epa_range} mi
            </Text>
            <Text
              fontSize="xs
            "
              fontWeight="bold"
            >
              Avg rating: <CarScore score={car.average_rating} />
            </Text>
            {/* <p>
              <Icon as={MdElectricCar} boxSize={8} />
              {car.epa_range} miles
            </p> */}
          </VStack>
        </CardBody>
      </Link>
    </Card>
  );
};

export default CarCard;
