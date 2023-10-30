import { Webhook } from "svix";
import { headers } from "next/headers";
import { EmailAddressJSON, WebhookEvent } from "@clerk/nextjs/server";
import { api } from "@/trpc/server";

import { env } from "@/env.mjs";

/**
 * Need to add better error handling and add queue for processing
 * @param req webhook event from svix
 * @returns
 */

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Missing WEBHOOK_SECRET environment variable. Retrieve from Clerk.",
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = (await req.json()) as WebhookEvent;
  const body = JSON.stringify(payload);

  // Create a new SVIX instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    // now test the type of the end point and update db accordingly

    let id: string | undefined,
      username: string | null,
      image_url: string,
      first_name: string,
      // created_at: number,
      email_addresses: EmailAddressJSON[];

    switch (evt.type) {
      case "user.created":
        console.log("User created");

        try {
          ({ id, username, email_addresses, first_name } = evt.data);

          if (!email_addresses[0]?.email_address) {
            return new Response(
              `Received 'user.created' webhook, but did not have email so not updated db.`,
              {
                status: 200,
              },
            );
          }

          await api.users.createUser.mutate({
            id,
            username: username ?? "",
            firstName: first_name,
            email: email_addresses[0]?.email_address,
          });

          return new Response(`Account ${id} Created`, { status: 201 });
        } catch (err) {
          console.error("Error processing 'user.created' event:", err);
          return new Response(
            `Received 'user.created' webhook, but an error occurred during processing.`,
            {
              status: 200,
            },
          );
        }

      case "user.updated":
        console.log("User updated");

        // const { id, username, image_url } = evt.data;

        ({ id, username, image_url } = evt.data);

      case "user.deleted":
        console.log("User deleted");

        try {
          ({ id } = evt.data);

          if (!id) {
            return new Response(
              `Received 'user.deleted' webhook, but did not have id so not updated db.`,
              {
                status: 200,
              },
            );
          }

          await api.users.deleteUser.mutate({
            id,
          });

          await api.friendships.deleteAllFriends.mutate({
            userId: id,
          });

          return new Response(`Account ${id} Deleted`, { status: 201 });
        } catch (err) {
          console.error("Error processing 'user.deleted' event:", err);
          return new Response(
            `Received 'user.deleted' webhook, but an error occurred during processing.`,
            {
              status: 200,
            },
          );
        }

      default:
        console.log("Unknown event type");
        break;
    }
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response(
      "Received webhook, but an error occurred during processing.",
      {
        status: 500,
      },
    );
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}\n\n`);
  console.log("Webhook body:", body);

  return new Response("", { status: 201 });
}
