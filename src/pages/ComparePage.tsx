import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Tbody,
  Tr,
  Th,
  Td,
  Thead,
  Image,
  HStack,
  Wrap,
  WrapItem,
  Tag,
  Center,
  Spinner,
  Button,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import NotFoundPage from "./NotFoundPage";
import apiClient from "../services/api-client";
import { formatPrice } from "../utils/formatPrice";
import { COMPARE_PAIRS } from "../data/seoPages";

interface RepModel {
  make_name: string;
  model: string;
  image_url: string;
  current_price: number | null;
  epa_range: number | null;
  acceleration_0_60: number | null;
  top_speed: number | null;
  power: number | null;
  battery_capacity: number | null;
  battery_max_charging_speed: number | null;
  number_of_full_adult_seats: number | null;
  drive_type: string | null;
  vehicle_class: string | null;
  average_rating: number | null;
  make_model_slug: string;
}

const useModel = (slug: string | undefined) =>
  useQuery({
    queryKey: ["model-details", slug],
    enabled: !!slug,
    queryFn: async ({ signal }) => {
      const res = await apiClient.get(`/cars/model-details/${slug}`, { signal });
      return res.data.representative_model as RepModel;
    },
  });

interface SpecRow {
  label: string;
  key: keyof RepModel;
  better: "high" | "low" | "none";
  fmt?: (v: unknown) => string;
}

const ROWS: SpecRow[] = [
  { label: "Starting price", key: "current_price", better: "low", fmt: (v) => formatPrice(v as number) },
  { label: "EPA range", key: "epa_range", better: "high", fmt: (v) => (v ? `${v} mi` : "—") },
  { label: "0–60 mph", key: "acceleration_0_60", better: "low", fmt: (v) => (v ? `${v} s` : "—") },
  { label: "Top speed", key: "top_speed", better: "high", fmt: (v) => (v ? `${v} mph` : "—") },
  { label: "Power", key: "power", better: "high", fmt: (v) => (v ? `${v} hp` : "—") },
  { label: "Battery", key: "battery_capacity", better: "high", fmt: (v) => (v ? `${v} kWh` : "—") },
  { label: "Max DC charging", key: "battery_max_charging_speed", better: "high", fmt: (v) => (v ? `${v} kW` : "—") },
  { label: "Seats", key: "number_of_full_adult_seats", better: "high", fmt: (v) => (v ? `${v}` : "—") },
  { label: "Drive", key: "drive_type", better: "none", fmt: (v) => (v ? `${v}` : "—") },
  { label: "Review score", key: "average_rating", better: "high", fmt: (v) => (v ? `${v}/10` : "—") },
];

export default function ComparePage() {
  const { pair } = useParams<{ pair: string }>();
  const [slugA, slugB] = (pair ?? "").split("-vs-");
  const a = useModel(slugA);
  const b = useModel(slugB);

  const headerBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(45,55,72,0.5)");
  const winBg = useColorModeValue("green.50", "rgba(34,197,94,0.15)");
  const subText = useColorModeValue("gray.600", "gray.400");

  if (!slugA || !slugB) return <NotFoundPage />;
  if (a.isLoading || b.isLoading)
    return (
      <Box>
        <NavBar />
        <Center minH="50vh">
          <Spinner size="xl" color="green.500" thickness="4px" />
        </Center>
      </Box>
    );
  if (!a.data || !b.data) return <NotFoundPage />;

  const A = a.data;
  const B = b.data;
  const nameA = `${A.make_name} ${A.model}`;
  const nameB = `${B.make_name} ${B.model}`;

  const winner = (row: SpecRow): 0 | 1 | -1 => {
    if (row.better === "none") return -1;
    const va = A[row.key] as number | null;
    const vb = B[row.key] as number | null;
    if (!va || !vb || va === vb) return -1;
    if (row.better === "high") return va > vb ? 0 : 1;
    return va < vb ? 0 : 1;
  };

  return (
    <Box>
      <NavBar />
      <Container maxW="4xl" py={8}>
        <Heading as="h1" size="lg" textAlign="center" mb={1}>
          {nameA} vs {nameB}
        </Heading>
        <Text textAlign="center" color={subText} mb={8}>
          Side-by-side specs from our live EV database — the better value in
          each row is highlighted.
        </Text>

        <Table
          size="sm"
          bg={headerBg}
          backdropFilter="blur(16px)"
          borderRadius="xl"
          overflow="hidden"
          sx={{ tableLayout: "fixed" }}
        >
          <Thead>
            <Tr>
              <Th w="28%"></Th>
              {[A, B].map((m, i) => (
                <Th key={i} textAlign="center" py={4}>
                  <RouterLink to={`/model_detail/${m.make_model_slug}`}>
                    <Image
                      src={m.image_url}
                      alt={`${m.make_name} ${m.model}`}
                      height="90px"
                      mx="auto"
                      objectFit="contain"
                      mb={2}
                    />
                    <Text fontSize="sm" textTransform="none" color="green.500">
                      {m.make_name} {m.model}
                    </Text>
                  </RouterLink>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {ROWS.map((row) => {
              const w = winner(row);
              return (
                <Tr key={row.label}>
                  <Td fontWeight="600" fontSize="xs">
                    {row.label}
                  </Td>
                  {[A, B].map((m, i) => (
                    <Td
                      key={i}
                      textAlign="center"
                      bg={w === i ? winBg : undefined}
                      fontWeight={w === i ? "700" : "400"}
                    >
                      <HStack justify="center" spacing={1}>
                        <Text fontSize="sm">
                          {row.fmt ? row.fmt(m[row.key]) : String(m[row.key] ?? "—")}
                        </Text>
                        {w === i && <Icon as={FaCheckCircle} color="green.500" boxSize={3} />}
                      </HStack>
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>

        <HStack justify="center" mt={8} spacing={4}>
          <Button as={RouterLink} to={`/model_detail/${A.make_model_slug}`} size="sm" variant="outline" colorScheme="green" borderRadius="full">
            {nameA} details
          </Button>
          <Button as={RouterLink} to={`/model_detail/${B.make_model_slug}`} size="sm" variant="outline" colorScheme="green" borderRadius="full">
            {nameB} details
          </Button>
        </HStack>

        <Box mt={12}>
          <Heading as="h2" size="sm" mb={3}>
            More comparisons
          </Heading>
          <Wrap>
            {COMPARE_PAIRS.filter((p) => p.pair !== pair).slice(0, 6).map((p) => (
              <WrapItem key={p.pair}>
                <Tag
                  as={RouterLink}
                  to={`/compare/${p.pair}`}
                  colorScheme="green"
                  variant="subtle"
                  borderRadius="full"
                  px={3}
                  py={1.5}
                  cursor="pointer"
                >
                  {p.label}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      </Container>
    </Box>
  );
}
