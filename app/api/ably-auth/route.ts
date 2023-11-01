import Ably from "ably";
import type { Types } from "ably";

const client = new Ably.Rest({
  key: process.env.ABLY_API_KEY,
});

export const revalidate = 0;

export async function GET(request: Request) {
  const tokenParams: Types.TokenParams = {
    clientId: `mading-live`,
    capability: { "*": ["publish", "subscribe", "presence"] },
  };

  return new Promise<Response>((resolve) => {
    client.auth.createTokenRequest(tokenParams, (err, token) => {
      if (err) {
        resolve(
          Response.json(
            { error: "Failed to generate token request" },
            { status: 500 }
          )
        );
      } else {
        resolve(
          Response.json(token, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          })
        );
      }
    });
  });
}
