"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const settingsFormScheme = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 3 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    })
    .optional(),
  username: z
    .string()
    .min(3, {
      message: "Username must be at least 3 characters.",
    })
    .max(15, {
      message: "Username cannot be more than 15 characters",
    })
    .optional(),
  password: z
    .string()
    .min(0, {
      message: "Password must be at least 8 characters.",
    })
    .optional(),
});

type SettingsFormScheme = z.infer<typeof settingsFormScheme>;

interface SettingsCard {
  imageUrl: string;
}

function SettingsCard() {
  const { user } = useUser();

  const defaultValues = {
    name: "alice",
    username: "alice12345",
    password: "password",
  };

  const form = useForm<SettingsFormScheme>({
    resolver: zodResolver(settingsFormScheme),
    defaultValues,
  });

  function onSubmit(values: SettingsFormScheme) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Card className="h-full">
      <CardHeader className="items-center">
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          <Avatar className="my-2 h-24 w-24">
            <AvatarImage src={user?.imageUrl} alt="Profile Picture" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <div className="text-center">{user?.username}</div>
        </CardDescription>
      </CardHeader>
      <Separator className="mb-2" />
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder={user?.firstName ?? ""} {...field} />
                  </FormControl>
                  <FormDescription>This is your name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder={"verySafePassword"} {...field} />
                  </FormControl>
                  <FormDescription>Create a safe password</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="items-center">Save</Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex items-center justify-center"></CardFooter>
    </Card>
  );
}

export default SettingsCard;
