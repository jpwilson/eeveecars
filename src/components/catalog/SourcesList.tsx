import { useState } from "react";
import { Box, Button, Heading, Link, ListItem, Text, UnorderedList, useColorModeValue } from "@chakra-ui/react";
import { CatalogSource } from "../../types/catalog";

interface Props {
  sources: (CatalogSource | null | undefined)[];
  /** how many to show before "Show all" */
  initial?: number;
  title?: string;
  updatedAt?: string | null;
}

/** De-duplicated list of source links ("Sources"). */
export default function SourcesList({ sources, title = "Sources", updatedAt, initial = 8 }: Props) {
  const sub = useColorModeValue("gray.500", "gray.400");
  const [all, setAll] = useState(false);
  const seen = new Set<string>();
  const unique: CatalogSource[] = [];
  for (const s of sources) {
    if (!s?.url || seen.has(s.url)) continue;
    seen.add(s.url);
    unique.push(s);
  }
  if (!unique.length && !updatedAt) return null;
  return (
    <Box>
      <Heading as="h2" size="sm" mb={2}>
        {title}
      </Heading>
      {unique.length > 0 ? (
        <UnorderedList spacing={1} fontSize="sm" ml={5}>
          {(all ? unique : unique.slice(0, initial)).map((s) => (
            <ListItem key={s.url!} wordBreak="break-word">
              <Link href={s.url!} isExternal rel="noopener noreferrer" color="green.600">
                {s.name || s.url}
              </Link>
              {s.fields && s.fields.length > 0 && (
                <Text as="span" color={sub}>
                  {" "}
                  ({s.fields.join(", ")})
                </Text>
              )}
            </ListItem>
          ))}
        </UnorderedList>
      ) : (
        <Text fontSize="sm" color={sub}>
          No sources recorded yet.
        </Text>
      )}
      {unique.length > initial && (
        <Button size="xs" variant="link" colorScheme="green" mt={2} onClick={() => setAll((v) => !v)}>
          {all ? "Show fewer" : `Show all ${unique.length} sources`}
        </Button>
      )}
      {updatedAt && (
        <Text fontSize="xs" color={sub} mt={3}>
          Last updated {updatedAt}
        </Text>
      )}
    </Box>
  );
}
