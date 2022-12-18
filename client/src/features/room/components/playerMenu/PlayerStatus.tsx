import { css, StyleSheet } from "aphrodite";
import { GenericPlayer } from "features/room/utils/game";
import { useMemo } from "react";
import { DefaultProps } from "utils/styles";
import { Theme } from "utils/theme";

type ConnectionStatus = "CONNECTED" | "AWAY" | "DISCONNECTED";

const ConnectionStatusColour: { readonly [T in ConnectionStatus]: string } = {
  CONNECTED: Theme.intentSuccess,
  AWAY: Theme.intentWarning,
  DISCONNECTED: Theme.intentDanger,
};

type PlayerStatusProps = DefaultProps & {
  readonly player: GenericPlayer;
};

const PlayerStatus: React.FC<PlayerStatusProps> = ({ style, player }) => {
  const connectionStatus = useMemo((): ConnectionStatus => {
    if (!player.isConnected) {
      return "DISCONNECTED";
    }

    if (player.isAway) {
      return "AWAY";
    }

    return "CONNECTED";
  }, [player]);

  const styles = useStyleSheet({ connectionStatus });

  return <div className={css(styles.root, style)} />;
};

const useStyleSheet = ({
  connectionStatus,
}: {
  readonly connectionStatus: ConnectionStatus;
}) => {
  return useMemo(
    () =>
      StyleSheet.create({
        root: {
          width: 8,
          height: 8,
          backgroundColor: ConnectionStatusColour[connectionStatus],
          borderRadius: "50%",
        },
      }),
    [connectionStatus]
  );
};

export default PlayerStatus;
