import { Button, H3, Text } from "@blueprintjs/core";
import { css, StyleSheet } from "aphrodite";
import { toaster } from "server";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePost } from "utils/api";

const Home = () => {
  const styles = useStyleSheet();
  const navigate = useNavigate();

  const { call: createRoom } = usePost("/api/create-room");

  const handleCreateRoom = async () => {
    const { ok, message, data } = await createRoom({
      roomName: "cool room",
    });

    if (data == null || !ok) {
      toaster.show({
        message: message ?? "Something went wrong",
        intent: "danger",
      });
      return;
    }

    navigate(`/room/${data.roomId}`);
  };

  return (
    <div className={css(styles.root)}>
      <H3 className={css(styles.header)}>Welcome to Poker!</H3>
      <Text className={css(styles.desc)}>Get started by creating a room.</Text>
      <Button intent="primary" onClick={() => handleCreateRoom()}>
        Create a room
      </Button>
    </div>
  );
};

const useStyleSheet = () => {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        },
        header: {
          marginBottom: 32,
        },
        desc: {
          marginBottom: 16,
        },
      }),
    []
  );
};

export default Home;
