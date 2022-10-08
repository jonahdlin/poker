import { PossiblePorts, TransientMockDatabase } from "src/db/db";
import { Express } from "express";
import { createGetEndpoint, createPostEndpoint } from "src/utils/api";
import { v4 as uuidv4 } from "uuid";
import { createRoomWs } from "src/api/session";
import { generateGuestName, getAvailablePort } from "src/utils/session";
import {
  DEFAULT_BIG_BLING,
  DEFAULT_MAX_MESSAGE_LENGTH,
  MAX_INITIAL_CHIP_COUNT,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
} from "src/utils/constants";

export const createApi = (app: Express) => {
  createGetEndpoint({
    app,
    endpoint: "/api/get-room",
    action: (req) => {
      const room = TransientMockDatabase.sessions[req.id];

      if (room == null) {
        return {
          ok: false,
          message: "Could not find that room",
        };
      }

      return {
        ok: true,
        data: {
          port: room.port,
          name: room.name,
        },
      };
    },
  });

  createPostEndpoint({
    app,
    endpoint: "/api/create-room",
    action: (req) => {
      const roomId = uuidv4();
      const port = getAvailablePort(
        PossiblePorts,
        Object.values(TransientMockDatabase.sessions).map(({ port }) => port)
      );
      TransientMockDatabase.sessions[roomId] = {
        port,
        name: req.roomName,

        maxTextMessageLength: DEFAULT_MAX_MESSAGE_LENGTH,
        maxNameLength: MAX_NAME_LENGTH,
        minNameLength: MIN_NAME_LENGTH,
        maxInitialChipCount: MAX_INITIAL_CHIP_COUNT,
        minInitialChipCount: 1,

        players: [],
        gameStarted: false,
        textMessageHistory: [],
        bigBlind: DEFAULT_BIG_BLING,
      };
      createRoomWs(app, port);
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
          port: room.port,
        },
      };
    },
  });
};
