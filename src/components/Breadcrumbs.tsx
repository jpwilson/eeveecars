import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

export interface BreadcrumbItem_ {
  label: string;
  to?: string;
}

interface Props {
  items: BreadcrumbItem_[];
}

const Breadcrumbs = ({ items }: Props) => {
  const textColor = useColorModeValue("gray.500", "gray.400");
  const activeColor = useColorModeValue("gray.800", "gray.100");

  return (
    <Breadcrumb
      separator={<FaChevronRight size={10} color="gray" />}
      fontSize="sm"
      mb={4}
    >
      <BreadcrumbItem>
        <BreadcrumbLink as={RouterLink} to="/" color={textColor} _hover={{ color: "#16a34a" }}>
          Home
        </BreadcrumbLink>
      </BreadcrumbItem>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <BreadcrumbItem key={i} isCurrentPage={isLast}>
            {isLast || !item.to ? (
              <BreadcrumbLink color={activeColor} fontWeight="500" cursor="default" _hover={{}}>
                {item.label}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbLink as={RouterLink} to={item.to} color={textColor} _hover={{ color: "#16a34a" }}>
                {item.label}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
