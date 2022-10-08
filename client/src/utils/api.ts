import { useEffect, useMemo, useState } from "react";
import {
  GetEndpoint,
  GetEndpointIO,
  PostEndpoint,
  PostEndpointIO,
} from "schema/types";

export const useGet = <T extends GetEndpoint>(
  endpoint: T,
  body: GetEndpointIO<T>["req"]
): {
  readonly data?: GetEndpointIO<T>["res"];
  readonly isLoading: boolean;
} => {
  const [data, setData] = useState<GetEndpointIO<T>["res"] | undefined>(
    undefined
  );

  const bodyString = useMemo(() => JSON.stringify(body), [body]);

  useEffect(() => {
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: bodyString,
    })
      .then((res) => res.json())
      .then((resData: GetEndpointIO<T>["res"]) => setData(resData));
  }, [bodyString, endpoint]);

  return useMemo(
    () =>
      data === undefined
        ? {
            data,
            isLoading: true,
          }
        : {
            data,
            isLoading: false,
          },
    [data]
  );
};

export const usePost = <T extends PostEndpoint>(
  endpoint: T
): {
  readonly call: (
    body: PostEndpointIO<T>["req"]
  ) => Promise<PostEndpointIO<T>["res"]>;
} => {
  return {
    call: async (body: PostEndpointIO<T>["req"]) => {
      const response: PostEndpointIO<T>["res"] = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      }).then((res) => res.json());

      return response;
    },
  };
};
