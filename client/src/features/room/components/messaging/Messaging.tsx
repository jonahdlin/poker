import { Button, Divider, InputGroup, Text } from "@blueprintjs/core";
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import { css, StyleSheet } from "aphrodite";
import { GameStore } from "features/room/utils/game";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TextMessageHistoryEntry } from "schema/types";
import { DefaultProps } from "utils/styles";
import { Theme } from "utils/theme";

type MessagingProps = DefaultProps & {
  readonly gameStore: GameStore;
};

const getMessageId = (msg: TextMessageHistoryEntry) => {
  return `${msg.publicPlayerId}_${msg.time}`;
};

const Messaging: React.FC<MessagingProps> = ({ style, gameStore }) => {
  const styles = useStyleSheet();
  const [unsentMessage, setUnsentMessage] = useState<string>();
  // Assemble unique id from `${publicPlayerId}_${time.getTime()}` (unix time)
  // Really these should have actual unique IDs but this is good enough
  const [lastSeenMessage, setLastSeenMessage] = useState<string>();
  const [open, setOpen] = useState(false);

  const hasInput = unsentMessage != null && unsentMessage.trim().length > 0;
  const unsentMessageLength =
    unsentMessage == null ? 0 : unsentMessage.trim().length;
  const messageTooLong = unsentMessageLength > gameStore.maxTextMessageLength;
  const mostRecentMessageId = useMemo(() => {
    if (gameStore.textMessageHistory.length === 0) {
      return undefined;
    }
    const mostRecentMessage =
      gameStore.textMessageHistory[gameStore.textMessageHistory.length - 1];

    return getMessageId(mostRecentMessage);
  }, [gameStore]);

  const showUnreadBadge = useMemo(() => {
    return !open && mostRecentMessageId !== lastSeenMessage;
  }, [mostRecentMessageId, lastSeenMessage, open]);

  const sendMessage = useCallback(() => {
    if (
      !hasInput ||
      unsentMessage == null ||
      messageTooLong ||
      gameStore.me?.textMessageTimeout != null
    ) {
      return;
    }

    gameStore.onSendTextMessage(unsentMessage.trim());
    setUnsentMessage(undefined);
  }, [gameStore, unsentMessage, hasInput, messageTooLong]);

  useEffect(() => {
    const sendFunc = (ev: KeyboardEvent) => {
      if (ev.key === "Enter") {
        sendMessage();
      }
    };
    window.addEventListener("keyup", sendFunc);

    return () => window.removeEventListener("keyup", sendFunc);
  }, [sendMessage]);

  return (
    <div className={css(style)}>
      <Popover2
        isOpen={open}
        onClose={() => {
          setLastSeenMessage(mostRecentMessageId);
          setOpen(false);
        }}
        onOpened={() => {
          setLastSeenMessage(mostRecentMessageId);
        }}
        content={
          <div className={css(styles.messages)}>
            <div className={css(styles.inputRow)}>
              <InputGroup
                className={css(styles.input)}
                value={unsentMessage || ""}
                onChange={({ target: { value } }) => {
                  setUnsentMessage(value);
                }}
                round
                autoFocus
              />
              <Tooltip2
                content={
                  gameStore.me?.textMessageTimeout != null
                    ? `Disabled for ${gameStore.me.textMessageTimeout}s`
                    : "Message is too long!"
                }
                disabled={
                  gameStore.me?.textMessageTimeout == null && !messageTooLong
                }
              >
                <Button
                  minimal
                  icon="send-message"
                  intent="primary"
                  onClick={() => sendMessage()}
                  className={css(
                    (!hasInput ||
                      messageTooLong ||
                      gameStore.me?.textMessageTimeout != null) &&
                      styles.disabled
                  )}
                />
              </Tooltip2>
            </div>
            {gameStore.textMessageHistory.length > 0 ? (
              gameStore.textMessageHistory
                .reduce<TextMessageHistoryEntry[]>(
                  (acc, el) => [el, ...acc],
                  []
                )
                .map((msg) => {
                  const { publicPlayerId, message } = msg;
                  const player = gameStore.getPlayerByPublicId(publicPlayerId);
                  return (
                    <>
                      <Divider key={`divider_${getMessageId(msg)}`} />
                      <Text
                        key={getMessageId(msg)}
                        className={css(styles.message)}
                      >
                        <strong>
                          {player?.name ??
                            player?.guestName ??
                            "Unknown player"}
                          :
                        </strong>
                        {"  "}
                        {message}
                      </Text>
                    </>
                  );
                })
            ) : (
              <>
                <Divider />
                <i>No messages yet</i>
              </>
            )}
          </div>
        }
        placement="top-start"
      >
        <div className={css(styles.buttonContainer)}>
          <Button
            className={css(styles.button)}
            icon="chat"
            onClick={() => setOpen(!open)}
            intent={open ? "primary" : "none"}
            outlined
          />
          {showUnreadBadge && <div className={css(styles.unreadBadge)} />}
        </div>
      </Popover2>
    </div>
  );
};

const useStyleSheet = () => {
  return useMemo(
    () =>
      StyleSheet.create({
        button: {
          height: 42,
          width: 42,
          borderRadius: "50%",
        },
        messages: {
          display: "flex",
          flexDirection: "column-reverse",
          alignItems: "stretch",
          gap: 2,
          maxHeight: 400,
          width: 408,
          overflowY: "auto",
          overflowX: "hidden",
          padding: 24,
          wordWrap: "break-word",
        },
        inputRow: {
          display: "flex",
          marginTop: 6,
          justifyContent: "flex-end",
          gap: 4,
        },
        input: {
          maxWidth: 500,
          flex: 1,
        },
        message: {},
        buttonContainer: {
          position: "relative",
        },
        disabled: {
          opacity: 0.65,
          cursor: "default",
          pointerEvents: "none",
        },
        unreadBadge: {
          backgroundColor: Theme.dangerLight,
          borderRadius: "50%",
          position: "absolute",
          height: 12,
          width: 12,
          right: 0,
          top: 0,
        },
      }),
    []
  );
};

export default Messaging;
