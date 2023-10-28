import { Card, CardBody, Skeleton, SkeletonText } from "@chakra-ui/react";
import CarCardContainer from "./CarCardContainer";

const CarCardSkeleton = () => {
  return (
    <Card>
      <Skeleton height="200px" />
      <CardBody>
        <SkeletonText />
      </CardBody>
    </Card>
  );
};

export default CarCardSkeleton;
