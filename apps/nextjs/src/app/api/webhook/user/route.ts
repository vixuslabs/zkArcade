import { headers } from "next/headers";
import { env } from "@/env.mjs";
import { api } from "@/trpc/server";
import type { EmailAddressJSON, WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";

/**
 * Need to add better error handling and add queue for processing
 * @param req webhook event from svix
 * @returns
 */

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

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

    let id: string | undefined,
      username: string | null,
      image_url: string,
      email_addresses: EmailAddressJSON[];

    switch (evt.type) {
      case "user.created":
        console.log("User created");

        try {
          ({ id, username, email_addresses, image_url } = evt.data);

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
            email: email_addresses[0]?.email_address,
            imageUrl: image_url,
          });

          return new Response(`Account ${id} Created`, { status: 201 });
        } catch (err) {
          console.error("Error processing 'user.created' event:", err);
          return new Response(
            `Received 'user.created' webhook, but an error occurred during processing.`,
            {
              status: 500,
            },
          );
        }

      case "user.updated":
        ({ id, username, image_url } = evt.data);

        console.log("User updated");

        console.log("id: ", id);

        if (!username) {
          return new Response(
            `Received 'user.updated' webhook, but did not have username so not updated db.`,
            {
              status: 200,
            },
          );
        }

        try {
          await api.users.updateUser.mutate({
            id: id,
            username: username,
            imageUrl: image_url,
          });

          return new Response(`Account ${id} Updated`, { status: 200 });
        } catch (err) {
          console.error("Error processing 'user.created' event:", err);
          return new Response(
            `Received 'user.updated' webhook, but an error occurred during processing.`,
            {
              status: 500,
            },
          );
        }

      case "user.deleted":
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
              status: 500,
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
