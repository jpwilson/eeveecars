import { HStack, IconButton, Text, useColorModeValue } from "@chakra-ui/react";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  XIcon,
  LinkedinIcon,
  WhatsappIcon,
} from "react-share";

interface Props {
  url: string;
  title: string;
  description?: string;
}

const ShareButtons = ({ url, title, description }: Props) => {
  const textColor = useColorModeValue("gray.500", "gray.400");

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch {
        // User cancelled
      }
    }
  };

  return (
    <HStack spacing={2} align="center">
      <Text fontSize="xs" fontWeight="600" color={textColor} textTransform="uppercase" letterSpacing="0.05em">
        Share
      </Text>
      <FacebookShareButton url={url}>
        <FacebookIcon size={28} round />
      </FacebookShareButton>
      <TwitterShareButton url={url} title={title}>
        <XIcon size={28} round />
      </TwitterShareButton>
      <LinkedinShareButton url={url} title={title} summary={description}>
        <LinkedinIcon size={28} round />
      </LinkedinShareButton>
      <WhatsappShareButton url={url} title={title}>
        <WhatsappIcon size={28} round />
      </WhatsappShareButton>
      {typeof navigator !== "undefined" && !!navigator.share && (
        <IconButton
          aria-label="Share via device"
          icon={<Text fontSize="lg">&#x1F4E4;</Text>}
          size="sm"
          variant="ghost"
          onClick={handleNativeShare}
          borderRadius="full"
        />
      )}
    </HStack>
  );
};

export default ShareButtons;
