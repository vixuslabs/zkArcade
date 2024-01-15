import React, { Fragment } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/react";

const IS_EXTERNAL_LINK = true;

function FriendsListData() {
  const [activeFriends, _] = api.friendships.getUsersFriends.useSuspenseQuery(
    {
      externalLink: IS_EXTERNAL_LINK,
    },
    {
      refetchOnWindowFocus: false,
      // refetchOnMount: false,
      cacheTime: 6000,
      trpc: {
        ssr: false,
      },
    },
  );

  return (
    <ul className="divide-y divide-gray-100">
      {activeFriends.map(({ username, imageUrl, id }) => (
        <Fragment key={username ?? id}>
          <li className="flex items-center justify-between gap-x-6 py-5">
            <div className="flex min-w-0 gap-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    IS_EXTERNAL_LINK
                      ? imageUrl ?? ""
                      : `/api/imageProxy?url=${encodeURIComponent(
                          imageUrl ?? "",
                        )}` ?? undefined
                  }
                  alt="Profile Picture"
                />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-auto">
                <p className="font-semibold leading-6">{username}</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Invite
            </button>
          </li>
          {/* <Separator /> */}
        </Fragment>
      ))}
    </ul>
  );
}

export default FriendsListData;
