import { Alert, Spinner, Text } from "@blueprintjs/core";
import { css, StyleSheet } from "aphrodite";
import RoomPage from "features/room/components/RoomPage";
import { sortBy, takeRight } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { useParams } from "react-router-dom";
import { usePost } from "utils/api";

const ROOM_COOKIE = "thursday-night-poker";
const MAX_STORED_SESSIONS = 1000;
type RoomCookieData = {
  readonly lastJoinedTime: number; // unix
  readonly secretPlayerId: string;
};
type CookieContent = {
  readonly [roomId: string]: RoomCookieData;
};

const isRoomCookieData = (arg: unknown): arg is RoomCookieData => {
  return (
    typeof arg === "object" &&
    arg !== null &&
    Object.prototype.hasOwnProperty.call(arg, "lastJoinedTime") &&
    typeof (arg as RoomCookieData).lastJoinedTime === "number" &&
    Object.prototype.hasOwnProperty.call(arg, "secretPlayerId") &&
    typeof (arg as RoomCookieData).secretPlayerId === "string"
  );
};

const isCookieContent = (arg: unknown): arg is CookieContent => {
  return (
    typeof arg === "object" &&
    arg !== null &&
    Object.keys(arg).every((key) => typeof key === "string") &&
    Object.values(arg).every((value) => isRoomCookieData(value))
  );
};

const Room: React.FC = () => {
  const styles = useStyleSheet();

  const { roomId } = useParams();
  const [cookies, _setCookie] = useCookies([ROOM_COOKIE]);

  const setCookie = (content: CookieContent) => {
    _setCookie(ROOM_COOKIE, JSON.stringify(content), { path: "/" });
  };

  const cookieContent = isCookieContent(cookies[ROOM_COOKIE])
    ? cookies[ROOM_COOKIE]
    : undefined;
  const initialSecretId =
    cookieContent === undefined || roomId === undefined
      ? undefined
      : cookieContent[roomId]?.secretPlayerId;

  // set in joining stage
  const [secretPlayerId, setSecretPlayerId] = useState<string>();
  const [publicPlayerId, setPublicPlayerId] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const { call: joinRoom } = usePost("/api/join-room");

  const updateCookie = (secretId: string) => {
    if (roomId === undefined) {
      return;
    }

    if (cookieContent === undefined) {
      const content: CookieContent = {
        [roomId]: {
          secretPlayerId: secretId,
          lastJoinedTime: new Date().getTime(),
        },
      };
      setCookie(content);
      return;
    }

    if (cookieContent[roomId] !== undefined) {
      const content: CookieContent = {
        ...cookieContent,
        [roomId]: {
          secretPlayerId: secretId,
          lastJoinedTime: new Date().getTime(),
        },
      };
      setCookie(content);
      return;
    }

    if (Object.keys(cookieContent).length >= MAX_STORED_SESSIONS - 1) {
      const trimmedContent = takeRight(
        sortBy(
          Object.entries(cookieContent),
          ([_, { lastJoinedTime }]) => lastJoinedTime
        ),
        MAX_STORED_SESSIONS - 1
      ).reduce<CookieContent>(
        (acc, [room, roomContent]) => {
          return {
            ...acc,
            [room]: roomContent,
          };
        },
        {
          [roomId]: {
            secretPlayerId: secretId,
            lastJoinedTime: new Date().getTime(),
          },
        }
      );
      setCookie(trimmedContent);
      return;
    }

    setCookie({
      ...cookieContent,
      [roomId]: {
        secretPlayerId: secretId,
        lastJoinedTime: new Date().getTime(),
      },
    });
  };

  useEffect(() => {
    if (secretPlayerId != null || roomId == null) {
      return;
    }
    const join = async () => {
      const { ok, message, data } = await joinRoom({
        roomId,
        secretPlayerId: initialSecretId,
      });

      if (!ok || data == null) {
        setErrorMessage(
          message ?? "Encountered a problem while joining the room."
        );
        return;
      }

      setSecretPlayerId(data.secretPlayerId);
      setPublicPlayerId(data.publicPlayerId);
      updateCookie(data.secretPlayerId);
    };

    join();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, secretPlayerId, initialSecretId]);

  const loading = errorMessage == null && secretPlayerId == null;

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
    if (secretPlayerId == null) {
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

    if (roomId == null) {
      return <Text>Room not found</Text>;
    }

    if (secretPlayerId == null || publicPlayerId == null) {
      return <Text>Lost connection to the room</Text>;
    }

    return (
      <RoomPage
        roomId={roomId}
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
