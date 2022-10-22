import { css, StyleSheet } from "aphrodite";
import Messaging from "features/room/components/messaging/Messaging";
import PokerControls from "features/room/components/controls/PokerControls";
import { useGame } from "features/room/utils/game";
import { useMemo } from "react";
import { DefaultProps } from "utils/styles";
import Table from "./table/Table";

type RoomPageProps = DefaultProps & {
  readonly port: number;
  readonly secretPlayerId: string;
  readonly publicPlayerId: string;
};

const RoomPage: React.FC<RoomPageProps> = ({
  style,
  port,
  secretPlayerId,
  publicPlayerId,
}) => {
  const styles = useStyleSheet();

  const gameStore = useGame({
    port,
    secretPlayerId,
    publicPlayerId,
  });

  return (
    <div className={css(styles.root, style)}>
      <div className={css(styles.mainContent)}>
        <Table style={styles.table} gameStore={gameStore} />
      </div>
      <div className={css(styles.footer)}>
        <Messaging gameStore={gameStore} />
        <PokerControls gameStore={gameStore} />
      </div>
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
          alignItems: "stretch",
          gap: 16,
          alignSelf: "stretch",
          justifyContent: "space-between",
        },
        mainContent: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          padding: 48,
        },
        table: {
          maxHeight: 1000,
          height: "100%",
          minHeight: 400,
          maxWidth: 1500,
          width: "100%",
          minWidth: 1050,
        },
        footer: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          padding: 16,
          height: 132,
        },
      }),
    []
  );
};

export default RoomPage;
