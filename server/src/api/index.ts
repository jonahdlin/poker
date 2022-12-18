import { TransientMockDatabase } from "src/db/db";
import { Express } from "express";
import { createPostEndpoint } from "src/utils/api";
import { v4 as uuidv4 } from "uuid";
import { createRoomWss } from "src/api/session";
import { generateGuestName } from "src/utils/session";
import {
  DEFAULT_BIG_BLIND,
  DEFAULT_MAX_MESSAGE_LENGTH,
  MAX_INITIAL_CHIP_COUNT,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from "src/utils/constants";

export const createApi = (app: Express) => {
  createPostEndpoint({
    app,
    endpoint: "/api/create-room",
    action: (req) => {
      const roomId = uuidv4();
      const wss = createRoomWss(roomId);
      TransientMockDatabase.sessions[roomId] = {
        id: roomId,
        wss,
        name: req.roomName,

        maxTextMessageLength: DEFAULT_MAX_MESSAGE_LENGTH,
        maxNameLength: MAX_NAME_LENGTH,
        minNameLength: MIN_NAME_LENGTH,
        maxInitialChipCount: MAX_INITIAL_CHIP_COUNT,
        minInitialChipCount: 1,

        players: [],
        gameStarted: false,
        textMessageHistory: [],
        bigBlind: DEFAULT_BIG_BLIND,
      };
      console.log(`Room created with id ${roomId}`);
      return {
        ok: true,
        message: undefined,
        data: {
          roomId,
        },
      };
    },
  });

  createPostEndpoint({
    app,
    endpoint: "/api/join-room",
    action: (req) => {
      const room = TransientMockDatabase.sessions[req.roomId];
      if (room == null) {
        return {
          ok: false,
          message: "Could not find that room",
        };
      }

      console.log(req.secretPlayerId);

      if (req.secretPlayerId !== undefined) {
        const player = room.players.find(
          ({ secretId }) => secretId === req.secretPlayerId
        );

        if (player === undefined || player.isConnected) {
          return {
            ok: false,
            message: "Could not find you at this table",
          };
        }

        player.isConnected = true;

        return {
          ok: true,
          data: {
            secretPlayerId: player.secretId,
            publicPlayerId: player.publicId,
          },
        };
      }

      const secretId = uuidv4();
      const publicId = uuidv4();

      room.players.push({
        secretId,
        publicId,
        isConnected: false,
        isLeader: room.players.length == 0,
        tablePosition: null,
        guestName: generateGuestName(
          room.players.map(({ guestName }) => guestName)
        ),
      });

      return {
        ok: true,
        data: {
          secretPlayerId: secretId,
          publicPlayerId: publicId,
        },
      };
    },
  });
};
