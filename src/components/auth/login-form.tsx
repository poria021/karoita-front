"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/services/auth.service";
import { loginSchema, type LoginSchema } from "@/lib/schemas";
import { useUserStore } from "@/store/useUserStore";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const [isVisible, setIsVisible] = useState(false);
  const id = useId();
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setUser(data.user);
      toast.success("ورود با موفقیت انجام شد");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "ورود ناموفق بود. لطفاً دوباره تلاش کنید.");
    },
  });

  const onSubmit = (data: LoginSchema) => {
    mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">ایمیل</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          dir="ltr"
          {...register("email")}
        />
        {errors.email && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>رمز عبور</Label>
        <div className="relative">
          <Input
            id={id}
            type={isVisible ? "text" : "password"}
            placeholder="رمز عبور"
            autoComplete="current-password"
            className="pe-9"
            dir="ltr"
            {...register("password")}
          />
          <button
            className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={toggleVisibility}
            aria-label={isVisible ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
            aria-pressed={isVisible}
            aria-controls={id}
          >
            {isVisible ? (
              <EyeOffIcon size={16} aria-hidden="true" />
            ) : (
              <EyeIcon size={16} aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <span className="text-xs text-red-500">
            {errors.password.message}
          </span>
        )}
      </div>
      <Button type="submit" className="mt-2 w-full" disabled={isPending}>
        {isPending ? "در حال ورود..." : "ورود"}
      </Button>
    </form>
  );
};

export default LoginForm;
