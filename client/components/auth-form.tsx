"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import GoogleSignIn from "./google-signin";
import ImageUpload from "./image-upload";
const schema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[0-9]/, "Add a number"),
  photo: z.string().url().optional().or(z.literal("")),
  role: z.enum(["supporter", "creator"]).optional(),
});
type Values = z.infer<typeof schema>;
export default function AuthForm({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const auth = useAuth();
  const {
    register: field,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { role: "supporter" },
  });
  const submit = async (v: Values) => {
    try {
      register ? await auth.register(v) : await auth.login(v.email, v.password);
      toast.success(register ? "Welcome to Fundora!" : "Welcome back!");
      router.push("/");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Please try again");
    }
  };
  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="card w-full max-w-md p-7 md:p-9"
    >
      <h1 className="text-3xl font-black">
        {register ? "Join Fundora" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-black/50">
        {register
          ? "Start with free credits and support a brave idea."
          : "Sign in to continue your funding journey."}
      </p>
      <div className="mt-7 space-y-4">
        {register && (
          <>
            <label className="block text-sm font-bold">
              Full name
              <input
                {...field("name")}
                className="input mt-2"
                placeholder="Your name"
              />
            </label>
            <label className="block text-sm font-bold">
              Profile picture URL
              <input
                {...field("photo")}
                className="input mt-2"
                placeholder="https://..."
              />
            </label>
            <ImageUpload
              label="Upload profile picture"
              value={watch("photo") || ""}
              onChange={(photo) =>
                setValue("photo", photo, { shouldValidate: true })
              }
            />
          </>
        )}
        <label className="block text-sm font-bold">
          Email
          <input
            {...field("email")}
            className="input mt-2"
            type="email"
            placeholder="you@example.com"
          />
        </label>
        <label className="block text-sm font-bold">
          Password
          <input
            {...field("password")}
            className="input mt-2"
            type="password"
            placeholder="8+ chars, uppercase & number"
          />
          {errors.password && (
            <small className="mt-1 block text-red-600">
              {errors.password.message}
            </small>
          )}
        </label>
        {register && (
          <label className="block text-sm font-bold">
            I want to join as
            <select {...field("role")} className="input mt-2">
              <option value="supporter">Supporter — get 50 credits</option>
              <option value="creator">Creator — get 20 credits</option>
            </select>
          </label>
        )}
      </div>
      <button
        disabled={isSubmitting}
        className="btn-primary mt-6 w-full disabled:opacity-50"
      >
        {isSubmitting
          ? "Please wait..."
          : register
            ? "Create account"
            : "Sign in"}
      </button>
      <GoogleSignIn role={watch("role")} />
      <p className="mt-5 text-center text-sm text-black/50">
        {register ? "Already a member?" : "New to Fundora?"}{" "}
        <Link
          className="font-bold text-forest"
          href={register ? "/login" : "/register"}
        >
          {register ? "Sign in" : "Create account"}
        </Link>
      </p>
    </form>
  );
}
