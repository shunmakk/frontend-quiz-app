import React from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Button } from "@chakra-ui/react";
import { CiLogout } from "react-icons/ci";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("ログアウトしますか？");
    if (confirmLogout) {
      auth.signOut();
      navigate("/");
      setTimeout(() => {
        window.alert("ログアウトに成功しました");
      }, 500);
    }
    return;
  };
  return (
    <>
      <Button
        onClick={handleLogout}
        leftIcon={<CiLogout />}
        colorScheme="orange"
        variant="ghost"
      >
        ログアウト
      </Button>
    </>
  );
};

export default LogoutButton;
