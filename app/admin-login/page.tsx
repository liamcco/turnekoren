import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";

interface AdminLoginPageProps {
  searchParams: Promise<{ from?: string; error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { from = "/accesstonepal", error } = await searchParams;

  const loginActionUrl = `/api/admin-login?from=${encodeURIComponent(from)}`;

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full border">
            <Lock className="size-5" />
          </div>
          <h1 className="text-2xl font-semibold">{APP_NAME}</h1>
          <p className="text-sm text-muted-foreground">Admin access only</p>
        </div>

        <form action={loginActionUrl} method="POST" className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter admin password"
              required
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">Incorrect password. Please try again.</p>
          )}

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
