import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, redirect: redirectTo } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Kings Education</CardTitle>
          <CardDescription>Hisobingizga kiring</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {decodeURIComponent(error)}
            </div>
          )}
          <form action={login} className="space-y-4">
            {redirectTo && (
              <input type="hidden" name="redirect" value={redirectTo} />
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full">
              Kirish
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Hisob yo&apos;qmi?{" "}
            <Link href="/register" className="font-medium underline underline-offset-4">
              Ro&apos;yxatdan o&apos;ting
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
