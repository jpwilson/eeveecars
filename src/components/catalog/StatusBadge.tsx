import { Badge, BadgeProps } from "@chakra-ui/react";
import { CatalogStatus } from "../../types/catalog";
import { STATUS_COLOR_SCHEME, STATUS_LABELS } from "../../utils/catalogFormat";

interface Props extends BadgeProps {
  status: CatalogStatus | null | undefined;
}

/** Effective status of a model / generation / variant. */
export default function StatusBadge({ status, ...rest }: Props) {
  if (!status) return null;
  return (
    <Badge
      colorScheme={STATUS_COLOR_SCHEME[status] ?? "gray"}
      variant="subtle"
      borderRadius="6px"
      px={2}
      textTransform="none"
      fontWeight="600"
      {...rest}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

/** "Defunct brand" / "Acquired" badge, shown next to models of a defunct make. */
export function BrandStatusBadge({ status, ...rest }: { status: string | null | undefined } & BadgeProps) {
  if (status !== "defunct" && status !== "acquired") return null;
  return (
    <Badge colorScheme="red" variant="outline" borderRadius="6px" px={2} textTransform="none" fontWeight="600" {...rest}>
      {status === "acquired" ? "Brand acquired" : "Defunct brand"}
    </Badge>
  );
}
