import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Center,
  HStack,
  Link,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { FaCheck, FaTimes, FaExternalLinkAlt, FaSyncAlt } from "react-icons/fa";
import adminApiClient from "../../services/admin-api-client";

interface Proposal {
  id: number;
  entity_type: string;
  entity_id: number;
  entity_label: string;
  field: string;
  old_value: unknown;
  new_value: unknown;
  source_name: string | null;
  source_url: string | null;
  confidence: number | null;
  rationale: string | null;
  created_at: string;
}

/** Data Inbox — pending change proposals from the crawl pipeline.
 * Approve applies the change and stamps provenance; reject archives it. */
export default function DataInbox() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "migration" | "error">("loading");
  const [busy, setBusy] = useState<number | null>(null);
  const toast = useToast();

  const rowBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(45,55,72,0.5)");
  const subText = useColorModeValue("gray.600", "gray.400");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await adminApiClient.get("/admin/proposals?status=pending&limit=200");
      setProposals(res.data.proposals);
      setPendingTotal(res.data.pending_total);
      setState("ready");
    } catch (err: any) {
      setState(err?.response?.status === 503 ? "migration" : "error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (id: number, action: "approve" | "reject") => {
    setBusy(id);
    try {
      await adminApiClient.patch(`/admin/proposals/${id}`, { action });
      setProposals((prev) => prev.filter((p) => p.id !== id));
      setPendingTotal((n) => Math.max(0, n - 1));
      toast({
        title: action === "approve" ? "Applied to catalog" : "Rejected",
        status: action === "approve" ? "success" : "info",
        duration: 2000,
      });
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err?.response?.data?.detail || err.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setBusy(null);
    }
  };

  if (state === "loading")
    return (
      <Center py={16}>
        <Spinner color="green.500" />
      </Center>
    );

  if (state === "migration")
    return (
      <Alert status="warning" borderRadius="lg">
        <AlertIcon />
        Data pipeline tables aren't set up yet — run migrations 002 and 003
        (ev_backend/migrations/) in the Supabase SQL Editor, then reload.
      </Alert>
    );

  if (state === "error")
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        Couldn't load proposals — check the admin key and try again.
      </Alert>
    );

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="sm" color={subText}>
          {pendingTotal} pending proposal{pendingTotal === 1 ? "" : "s"} from the
          crawl pipeline. Approving applies the change and stamps the source +
          verification date on the record.
        </Text>
        <Button size="xs" leftIcon={<FaSyncAlt />} onClick={load} variant="outline">
          Refresh
        </Button>
      </HStack>

      {proposals.length === 0 ? (
        <Alert status="success" borderRadius="lg">
          <AlertIcon />
          Inbox zero — no pending data changes. The daily crawl files new ones
          automatically.
        </Alert>
      ) : (
        <Box bg={rowBg} backdropFilter="blur(16px)" borderRadius="xl" overflowX="auto">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Vehicle / entity</Th>
                <Th>Field</Th>
                <Th isNumeric>Current</Th>
                <Th isNumeric>Proposed</Th>
                <Th>Source</Th>
                <Th>Why</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {proposals.map((p) => (
                <Tr key={p.id}>
                  <Td fontWeight="600" fontSize="sm">
                    {p.entity_label}
                    <Badge ml={2} fontSize="9px" colorScheme="gray">
                      {p.entity_type}
                    </Badge>
                  </Td>
                  <Td fontSize="sm">{p.field}</Td>
                  <Td isNumeric fontSize="sm" color="red.400">
                    {String(p.old_value ?? "—")}
                  </Td>
                  <Td isNumeric fontSize="sm" color="green.500" fontWeight="700">
                    {String(p.new_value ?? "—")}
                  </Td>
                  <Td fontSize="xs">
                    {p.source_url ? (
                      <Link href={p.source_url} isExternal color="green.500">
                        {p.source_name || "source"} <FaExternalLinkAlt style={{ display: "inline" }} size={9} />
                      </Link>
                    ) : (
                      p.source_name || "—"
                    )}
                  </Td>
                  <Td fontSize="xs" color={subText} maxW="280px">
                    <Text noOfLines={2}>{p.rationale}</Text>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <Button
                        size="xs"
                        colorScheme="green"
                        leftIcon={<FaCheck />}
                        isLoading={busy === p.id}
                        onClick={() => review(p.id, "approve")}
                      >
                        Apply
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        leftIcon={<FaTimes />}
                        isDisabled={busy === p.id}
                        onClick={() => review(p.id, "reject")}
                      >
                        Reject
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
