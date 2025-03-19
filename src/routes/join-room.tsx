import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formOptions, useForm, useStore } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircleIcon } from "lucide-react";

export const Route = createFileRoute("/join-room")({
  component: RouteComponent,
});

type Form = {
  name: string;
  create_room: boolean;
  room_id?: string;
};

const formOpts = formOptions({
  defaultValues: {
    name: "",
    create_room: false,
  } as Form,
});

function RouteComponent() {
  const form = useForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      // Do something with form data
      const timeout = new Promise((resolve) => setTimeout(resolve, 2000));
      await timeout;

      console.log(value);
    },
  });

  const create_room = useStore(form.store, (state) => state.values.create_room);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {create_room ? "Join Room" : "Create Room"}
          </CardTitle>
          <CardDescription>
            Enter your details to create or join a room
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="name"
              children={(field) => (
                <Input
                  placeholder="Your username here"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            />
            <form.Field
              name="create_room"
              children={(field) => (
                <div className="flex gap-2 justify-end">
                  <Label htmlFor="join-room">Join room?</Label>
                  <Switch
                    id="join-room"
                    checked={field.state.value}
                    onCheckedChange={(e) => field.handleChange(e)}
                  />
                </div>
              )}
            />

            {create_room && (
              <form.Field
                name="room_id"
                children={(field) => (
                  <div className="w-full flex justify-center items-center">
                    <InputOTP
                      maxLength={5}
                      minLength={5}
                      value={field.state.value}
                      onChange={field.handleChange}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                )}
              />
            )}

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ?
                      <LoaderCircleIcon className="animate-spin" />
                      : "Submit"}
                </Button>
              )}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
