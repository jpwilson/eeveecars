import { Badge } from "@chakra-ui/react";

interface Props {
  score: number;
}
const CarScore = ({ score }: Props) => {
  const color = score > 8 ? "green" : score > 5 ? "yellow" : "red";
  return (
    <Badge
      colorScheme={color}
      fontSize="12px"
      px={2}
      py={0.5}
      borderRadius="6px"
      fontWeight="600"
    >
      {score}
    </Badge>
  );
};

export default CarScore;
