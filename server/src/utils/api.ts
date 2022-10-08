import bodyParser from "body-parser";
import { Express } from "express";
import {
  GetEndpoint,
  GetEndpointIO,
  PostEndpoint,
  PostEndpointIO,
} from "src/types";

// create application/json parser
var JsonParser = bodyParser.json();

export const createGetEndpoint = <T extends GetEndpoint>({
  app,
  endpoint,
  action,
}: {
  readonly app: Express;
  readonly endpoint: T;
  readonly action: (
    request: GetEndpointIO<T>["req"]
  ) => GetEndpointIO<T>["res"];
}) => {
  app.post(endpoint, JsonParser, (req, res) => {
    const response = action(req.body as GetEndpointIO<T>["req"]);
    res.json(response);
  });
};

export const createPostEndpoint = <T extends PostEndpoint>({
  app,
  endpoint,
  action,
}: {
  readonly app: Express;
  readonly endpoint: T;
  readonly action: (
    request: PostEndpointIO<T>["req"]
  ) => PostEndpointIO<T>["res"];
}) => {
  app.post(endpoint, JsonParser, (req, res) => {
    const response = action(req.body as PostEndpointIO<T>["req"]);
    res.json(response);
  });
};
