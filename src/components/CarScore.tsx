import { Badge } from "@chakra-ui/react";

interface Props {
  score: number | null | undefined;
}

/** Review score badge (normalized /10). Renders nothing when there's no
 * data — a red "0" reads as broken data, the fastest trust-killer on a
 * spec site. */
const CarScore = ({ score }: Props) => {
  if (!score) return null;
  const color = score >= 8 ? "green" : score >= 6 ? "yellow" : "orange";
  return (
    <Badge
      colorScheme={color}
      fontSize="12px"
      px={2}
      py={0.5}
      borderRadius="6px"
      fontWeight="600"
    >
      {score.toFixed(1)}
    </Badge>
  );
};

export default CarScore;
