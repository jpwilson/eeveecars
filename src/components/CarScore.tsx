import { Badge } from "@chakra-ui/react";

interface Props {
  score: number;
}
const CarScore = ({ score }: Props) => {
  let color = score > 8 ? "green" : score < 5 ? "red" : "";
  return (
    <Badge colorScheme={color} fontSize="14px" paddingX={2} borderRadius={3}>
      {score}
    </Badge>
  );
};

export default CarScore;
