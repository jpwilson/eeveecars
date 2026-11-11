import { useEffect, useState } from "react";
import { AspectRatio, Box, Flex, Icon, Link, Text, useColorModeValue } from "@chakra-ui/react";
import { FaCar } from "react-icons/fa";
import { CatalogImageData } from "../../types/catalog";
import { responsiveSrc } from "../../utils/imageUrl";

interface Props {
  image: CatalogImageData | null | undefined;
  /** width / height of the box; cards 16:9, thumbnails 4:3 */
  ratio?: number;
  /** cover for cards, contain for the hero */
  fit?: "cover" | "contain";
  /** hero image: load eagerly with high priority */
  eager?: boolean;
  /** show "Photo: credit · licence" under the image (hero / large views) */
  showCredit?: boolean;
  /** alt text when the API gives none */
  fallbackAlt?: string;
  /** text in the neutral placeholder when there is no photo */
  placeholder?: string;
  borderRadius?: string;
  /** <img sizes>; defaults suit grid cards (hero: pass a larger one) */
  sizes?: string;
}

/**
 * The one component that displays a catalog photo: a fixed aspect-ratio box,
 * lazy loading, and a neutral placeholder when there is no photo (never a
 * photo of a different generation). `url` may be remote (Wikimedia Commons,
 * press sites) or a relative /pub_assets path.
 */
export default function CatalogImage({
  image,
  ratio = 16 / 9,
  fit = "cover",
  eager = false,
  showCredit = false,
  fallbackAlt = "",
  placeholder = "No photo of this version yet",
  borderRadius = "0",
  sizes,
}: Props) {
  // 0 = thumbnail (Commons) / file, 1 = original file, 2 = give up → placeholder
  const [attempt, setAttempt] = useState(0);
  const placeholderBg = useColorModeValue("gray.100", "gray.700");
  const placeholderFg = useColorModeValue("gray.400", "gray.500");
  const containBg = useColorModeValue("white", "gray.900");
  const creditColor = useColorModeValue("gray.500", "gray.400");

  const original = image?.url ?? null;
  const responsive = original ? responsiveSrc(original, eager ? 960 : 500) : null;
  const useThumb = attempt === 0 && responsive && responsive.src !== original;
  const url = !original || attempt >= 2 ? null : useThumb ? responsive!.src : original;
  const onError = () => setAttempt(useThumb ? 1 : 2);
  // A reused component showing another car starts over
  useEffect(() => setAttempt(0), [original]);

  return (
    <Box>
      <AspectRatio ratio={ratio} borderRadius={borderRadius} overflow="hidden">
        {url ? (
          <Box bg={fit === "contain" ? containBg : placeholderBg}>
            <img
              src={url}
              srcSet={useThumb ? responsive!.srcSet : undefined}
              sizes={useThumb ? sizes ?? (eager ? "(max-width: 768px) 100vw, 640px" : "(max-width: 480px) 50vw, (max-width: 1024px) 33vw, 280px") : undefined}
              alt={image?.alt || fallbackAlt}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              // fetchpriority is not in React 18's DOM typings
              {...(eager ? ({ fetchpriority: "high" } as Record<string, string>) : {})}
              width={image?.width ?? undefined}
              height={image?.height ?? undefined}
              onError={onError}
              style={{ width: "100%", height: "100%", objectFit: fit, objectPosition: "center" }}
            />
          </Box>
        ) : (
          <Flex bg={placeholderBg} direction="column" align="center" justify="center" gap={1} p={2} role="img" aria-label={placeholder}>
            <Icon as={FaCar} boxSize={7} color={placeholderFg} />
            <Text fontSize="xs" color={placeholderFg} textAlign="center" noOfLines={2}>
              {placeholder}
            </Text>
          </Flex>
        )}
      </AspectRatio>
      {showCredit && url && (image?.credit || image?.license) && (
        <Text fontSize="xs" color={creditColor} mt={1} noOfLines={2}>
          Photo:{" "}
          {image?.page_url ? (
            <Link href={image.page_url} isExternal rel="noopener noreferrer" textDecoration="underline">
              {[image.credit, image.license].filter(Boolean).join(" · ")}
            </Link>
          ) : (
            [image?.credit, image?.license].filter(Boolean).join(" · ")
          )}
          {image?.source === "commons" ? " (Wikimedia Commons)" : ""}
        </Text>
      )}
    </Box>
  );
}
