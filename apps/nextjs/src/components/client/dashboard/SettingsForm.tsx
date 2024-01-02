"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const handleUpdatedUser = (values: SettingsFormScheme) => {
  const updatedData: Partial<SettingsFormScheme> = {};
  const updatedPasswords: Partial<SettingsFormScheme> = {};

  if (values.username !== "") {
    updatedData.username = values.username;
  }

  if (values.currentPassword !== "") {
    updatedPasswords.currentPassword = values.currentPassword;
  }

  if (values.newPassword !== "") {
    updatedPasswords.newPassword = values.newPassword;
  }

  return { updatedData, updatedPasswords };
};

const settingsFormScheme = z.object({
  username: z.string().refine(
    (val) => {
      return (
        val === undefined || val === "" || (val.length >= 3 && val.length <= 24)
      );
    },
    {
      message:
        "Username must be at least 3 and no more than 15 characters long.",
    },
  ),
  currentPassword: z.string().refine(
    (val) => {
      return (
        val === undefined ||
        val === "" ||
        (val.length >= 8 &&
          val.length <= 24 &&
          val.match(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]+$/))
      );
    },
    {
      message:
        "Current password is at least 8 and no more than 24 characters long.",
    },
  ),
  newPassword: z.string().refine(
    (val) => {
      return (
        val === undefined ||
        val === "" ||
        (val.length >= 8 &&
          val.length <= 24 &&
          val.match(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]+$/))
      );
    },
    {
      message:
        "New password must be at least 8 and no more than 24 characters long.",
    },
  ),
});

type SettingsFormScheme = z.infer<typeof settingsFormScheme>;

function SettingsForm() {
  const { user } = useUser();
  const isExternalUser = useMemo(
    () => user?.externalAccounts.length !== 0,
    [user?.externalAccounts.length],
  );

  const defaultValues = {
    username: "",
    currentPassword: "",
    newPassword: "",
  };

  const form = useForm<SettingsFormScheme>({
    resolver: zodResolver(settingsFormScheme),
    defaultValues,
  });

  function onSubmit(values: SettingsFormScheme) {
    const { updatedData, updatedPasswords } = handleUpdatedUser(values);

    if (updatedPasswords.newPassword && updatedPasswords.currentPassword) {
      user
        ?.updatePassword({
          newPassword: updatedPasswords.newPassword,
          currentPassword: updatedPasswords.currentPassword,
          signOutOfOtherSessions: false,
        })
        .then(() => {
          toast({
            variant: "default",
            title: "Success",
            description: "Updated password",
            duration: 5000,
            action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
          });
        })
        .catch((error) => {
          console.log(error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update password, try again",
            duration: 5000,
            action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
          });
        });
    }

    if (updatedData.username !== undefined) {
      user
        ?.update({ ...updatedData })
        .then(() => {
          toast({
            variant: "default",
            title: "Success",
            description: "Updated account details",
            duration: 5000,
            action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
          });
        })
        .catch(() => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update account details",
            duration: 5000,
            action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
          });
        });
    }
  }

  return (
    <Card className="h-full overflow-scroll">
      <CardHeader className="items-center">
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          <div
            role="button"
            tabIndex={0}
            className="group relative"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                console.log("clicked profile picture");
              }
            }}
            onClick={() => console.log("clicked profile picture")}
          >
            <Avatar
              className={cn(
                "my-2 h-24 w-24 transition-all duration-300 ease-in-out hover:cursor-pointer group-hover:blur-sm",
              )}
            >
              <AvatarImage
                className="transform"
                src={`/api/imageProxy?url=${encodeURIComponent(
                  user?.imageUrl ?? "",
                )}`}
                alt="Profile Picture"
              />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <div
              className="
                        absolute inset-0 flex items-center justify-center
                        rounded-full text-center
                        font-bold text-white 
                        opacity-0 transition-all duration-300
                        ease-in-out group-hover:cursor-pointer group-hover:bg-black group-hover:opacity-50
                    "
            >
              Change Image
            </div>
          </div>
          <div className="text-center">{user?.username}</div>
        </CardDescription>
      </CardHeader>
      <Separator className="mb-2" />
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder={user?.username ?? ""} {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your username. It must be unique.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={""} {...field} />
                  </FormControl>
                  <FormDescription>Confirm current password</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={""} {...field} />
                  </FormControl>
                  <FormDescription>Change password</FormDescription>
                </FormItem>
              )}
            />
            <Button
              disabled={isExternalUser}
              type="submit"
              className={cn("z-20 w-full items-center rounded px-4 py-2 ")}
            >
              {isExternalUser
                ? `Change on ${user?.externalAccounts[0]?.provider}`
                : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default SettingsForm;
