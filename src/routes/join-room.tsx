"use client"

import { useAuth } from "@/components/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { formOptions, useForm, useStore } from "@tanstack/react-form"
import { createFileRoute } from "@tanstack/react-router"
import { LoaderCircleIcon, Users } from "lucide-react"

export const Route = createFileRoute("/join-room")({
  component: RouteComponent,
})

type Form = {
  name: string
  create_room: boolean
  room_id?: string
}

const formOpts = formOptions({
  defaultValues: {
    name: "",
    create_room: false,
  } as Form,
})

function RouteComponent() {
  const { login } = useAuth()

  const form = useForm({
    ...formOpts,
    onSubmit: async ({ value }) => {
      // Do something with form data
      // const timeout = new Promise((resolve) => setTimeout(resolve, 2000));
      // await timeout;

      // console.log(value);
      login(value.name)
    },
  })

  const create_room = useStore(form.store, (state) => state.values.create_room)

  return (
    // Dark background gradient
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-gray-950 to-gray-900 relative overflow-hidden">
      {/* Decorative floating elements in the background with varied rotations and transparency */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Bomb images with varied rotations and opacity */}
        <div className="absolute top-[10%] left-[15%] w-16 h-16 animate-float-slow rotate-12">
          <img src="public/img/bomb.svg" alt="Bomb" className="w-full h-full filter-dark-red opacity-30" />
        </div>

        <div className="absolute top-[30%] right-[10%] w-12 h-12 animate-float-medium -rotate-15">
          <img src="public/img/bomb.svg" alt="Bomb" className="w-full h-full filter-dark-red opacity-25" />
        </div>

        <div className="absolute bottom-[20%] left-[25%] w-10 h-10 animate-float-fast rotate-45">
          <img src="public/img/bomb.svg" alt="Bomb" className="w-full h-full filter-dark-red opacity-15" />
        </div>

        {/* Additional bombs with different rotations */}

        <div className="absolute top-[55%] right-[20%] w-15 h-15 animate-float-slow-reverse -rotate-95">
          <img src="public/img/bomb.svg" alt="Bomb" className="w-full h-full filter-dark-red opacity-25" />
        </div>

        {/* Flag SVGs with dark green color, varied rotations and opacity */}
        <div className="absolute top-[25%] right-[70%] w-10 h-10 animate-float-medium rotate-70">
          <svg viewBox="0 0 24 24" className="w-full h-full opacity-20">
            <rect x="6" y="2" width="2" height="20" fill="#555" />
            <path d="M8,4 L18,4 L16,9 L18,14 L8,14 Z" fill="#8b0000" fillOpacity="0.9" />
          </svg>
        </div>

        <div className="absolute top-[20%] right-[20%] w-14 h-14 animate-float-medium rotate-12">
          <svg viewBox="0 0 24 24" className="w-full h-full opacity-20">
            <rect x="6" y="2" width="2" height="20" fill="#555" />
            <path d="M8,4 L18,4 L16,9 L18,14 L8,14 Z" fill="#1b5e20" fillOpacity="0.9" />
          </svg>
        </div>

        <div className="absolute bottom-[15%] right-[25%] w-10 h-10 animate-float-slow -rotate-30">
          <svg viewBox="0 0 24 24" className="w-full h-full opacity-25">
            <rect x="6" y="2" width="2" height="20" fill="#555" />
            <path d="M8,4 L18,4 L16,9 L18,14 L8,14 Z" fill="#8b0000" fillOpacity="0.4" />
          </svg>
        </div>

        {/* Additional flags with different rotations */}
        <div className="absolute top-[50%] left-[10%] w-20 h-20 animate-float-medium-reverse rotate-30">
          <svg viewBox="0 0 24 24" className="w-full h-full opacity-15">
            <rect x="6" y="2" width="2" height="20" fill="#555" />
            <path d="M8,4 L18,4 L16,9 L18,14 L8,14 Z" fill="#1b5e20" fillOpacity="0.7" />
          </svg>
        </div>

        <div className="absolute top-[15%] left-[40%] w-6 h-6 animate-float-fast-reverse -rotate-10">
          <svg viewBox="0 0 24 24" className="w-full h-full opacity-10">
            <rect x="6" y="2" width="2" height="20" fill="#555" />
            <path d="M8,4 L18,4 L16,9 L18,14 L8,14 Z" fill="#1b5e20" fillOpacity="0.7" />
          </svg>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      </div>

      {/* Main card */}
      <Card className="w-full max-w-md relative backdrop-blur-sm bg-gray-900/90 border-gray-800 shadow-2xl">
        {/* Decorative corner elements with bomb SVG */}
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
          <img src="public/img/bomb.svg" alt="Bomb" className="w-3 h-3 filter-dark-red" />
        </div>
        <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 24 24" className="w-3 h-3">
            <rect x="6" y="2" width="2" height="20" fill="#555" />
            <path d="M8,4 L18,4 L16,9 L18,14 L8,14 Z" fill="#1b5e20" />
          </svg>
        </div>
        <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 24 24" className="w-3 h-3">
            <rect x="6" y="2" width="2" height="20" fill="#555" />
            <path d="M8,4 L18,4 L16,9 L18,14 L8,14 Z" fill="#8b0000" />
          </svg>
        </div>
        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
          <img src="public/img/bomb.svg" alt="Bomb" className="w-3 h-3 filter-dark-red" />
        </div>

        {/* Card header */}
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center mb-2 shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-bold text-blue-400">
            {create_room ? "Join Room" : "Create Room"}
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            Enter your details to {create_room ? "join" : "create"} a minesweeper game room
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            {/* Username field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-200">
                Your Username
              </Label>
              <div className="relative">
                <form.Field
                  name="name"
                  children={(field) => (
                    <Input
                      id="username"
                      className="pl-10 bg-gray-800 border-gray-700 focus:border-blue-500 transition-colors text-white"
                      placeholder="Enter your username"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>
            </div>

            {/* Toggle switch */}
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
              <form.Field
                name="create_room"
                children={(field) => (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="join-room" className="text-sm font-medium cursor-pointer text-gray-200">
                      {field.state.value ? "Join existing room" : "Create new room"}
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Create</span>
                      <Switch
                        id="join-room"
                        checked={field.state.value}
                        onCheckedChange={(e) => field.handleChange(e)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <span className="text-xs text-gray-400">Join</span>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Room ID input */}
            {create_room && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-center block text-gray-200">Enter Room Code</Label>
                <form.Field
                  name="room_id"
                  children={(field) => (
                    <div className="w-full flex justify-center items-center">
                      <InputOTP
                        maxLength={5}
                        minLength={5}
                        value={field.state.value}
                        onChange={field.handleChange}
                        className="gap-2"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={0}
                            className="bg-gray-800 border-gray-700 focus:border-blue-500 transition-colors w-12 h-12 text-white"
                          />
                          <InputOTPSlot
                            index={1}
                            className="bg-gray-800 border-gray-700 focus:border-blue-500 transition-colors w-12 h-12 text-white"
                          />
                          <InputOTPSlot
                            index={2}
                            className="bg-gray-800 border-gray-700 focus:border-blue-500 transition-colors w-12 h-12 text-white"
                          />
                          <InputOTPSlot
                            index={3}
                            className="bg-gray-800 border-gray-700 focus:border-blue-500 transition-colors w-12 h-12 text-white"
                          />
                          <InputOTPSlot
                            index={4}
                            className="bg-gray-800 border-gray-700 focus:border-blue-500 transition-colors w-12 h-12 text-white"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  )}
                />
              </div>
            )}

            {/* Submit button with bomb SVG */}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 transition-all mt-2 h-11 text-white"
                >
                  {isSubmitting ? (
                    <LoaderCircleIcon className="animate-spin mr-2" />
                  ) : create_room ? (
                    <>
                      {/* Flag SVG with dark green */}
                      <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                        <rect x="6" y="2" width="2" height="20" fill="gray" />
                        <path d="M8,4 L18,4 L16,9 L18,14 L8,14 Z" fill="green" />
                      </svg>
                      Join Game
                    </>
                  ) : (
                    <>
                      {/* Bomb SVG */}
                      <img src="public/img/bomb.svg" alt="Bomb" className="w-4 h-4 mr-2 filter-dark-red" />
                      Create Game
                    </>
                  )}
                </Button>
              )}
            />

            {/* Helper text */}
            <p className="text-xs text-center text-gray-300 mt-2">
              {create_room
                ? "Ask your friend for the room code to join their game"
                : "Create a room and share the code with friends to play together"}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

