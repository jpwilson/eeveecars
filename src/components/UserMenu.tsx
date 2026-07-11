import {
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaHeart, FaSignOutAlt, FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function UserMenu() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const menuBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue(
    "rgba(34,197,94,0.2)",
    "rgba(34,197,94,0.3)"
  );

  if (!user) return null;

  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <Menu>
      <MenuButton>
        <Avatar
          size="sm"
          name={user.displayName || user.email}
          src={user.avatarUrl}
          bg="green.500"
          color="white"
          cursor="pointer"
          _hover={{ ring: 2, ringColor: "green.400" }}
        />
      </MenuButton>
      <MenuList
        bg={menuBg}
        border="1px solid"
        borderColor={borderColor}
        shadow="lg"
        minW="180px"
      >
        <MenuItem
          icon={<FaHeart />}
          onClick={() => navigate("/dashboard")}
        >
          My Dashboard
        </MenuItem>
        {isAdmin && (
          <MenuItem
            icon={<FaUserShield />}
            onClick={() => navigate("/admin")}
            color="green.500"
          >
            Admin
          </MenuItem>
        )}
        <MenuDivider />
        <MenuItem
          icon={<FaSignOutAlt />}
          onClick={signOut}
        >
          Sign Out
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
