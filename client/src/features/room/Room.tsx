import { Alert, Spinner, Text } from "@blueprintjs/core";
import { css, StyleSheet } from "aphrodite";
import RoomPage from "features/room/components/RoomPage";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { usePost } from "utils/api";

const Room: React.FC = () => {
  const styles = useStyleSheet();

  // set in joining stage
  const [sessionPort, setSessionPort] = useState<number>();
  const [secretPlayerId, setSecretPlayerId] = useState<string>();
  const [publicPlayerId, setPublicPlayerId] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const { roomId } = useParams();

  const { call: joinRoom } = usePost("/api/join-room");

  useEffect(() => {
    if (sessionPort != null && secretPlayerId != null) {
      return;
    }
    const join = async () => {
      const { ok, message, data } = await joinRoom({
        roomId: roomId ?? "",
      });

      if (!ok || data == null) {
        setErrorMessage(
          message ?? "Encountered a problem while joining the room."
        );
        return;
      }

      setSessionPort(data.port);
      setSecretPlayerId(data.secretPlayerId);
      setPublicPlayerId(data.publicPlayerId);
    };

    join();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, sessionPort, secretPlayerId]);

  const loading =
    errorMessage == null && (sessionPort == null || secretPlayerId == null);

  if (errorMessage) {
    return (
      <div className={css(styles.root)}>
        <Alert intent="danger" isOpen>
          {errorMessage ?? "Could not connect to the room"}
        </Alert>
      </div>
    );
  }

  const getLoadingMessage = () => {
    if (sessionPort == null || secretPlayerId == null) {
      return "Approaching the table";
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Spinner className={css(styles.spinner)} intent="primary" size={75} />
          <Text>{getLoadingMessage()}</Text>
        </>
      );
    }

    if (
      sessionPort == null ||
      secretPlayerId == null ||
      publicPlayerId == null
    ) {
      return <Text>Lost connection to the room</Text>;
    }

    return (
      <RoomPage
        port={sessionPort}
        secretPlayerId={secretPlayerId}
        publicPlayerId={publicPlayerId}
      />
    );
  };

  return <div className={css(styles.root)}>{renderContent()}</div>;
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
        spinner: {
          marginBottom: 16,
        },
      }),
    []
  );
};

export default Room;
