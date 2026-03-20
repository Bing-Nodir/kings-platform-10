import { signup } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Kings Education</CardTitle>
          <CardDescription>Yangi hisob yarating</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {decodeURIComponent(error)}
            </div>
          )}
          <form action={signup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">To&apos;liq ism</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Ism Familiya"
                required
                autoComplete="name"
              />
            </div>
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
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full">
              Ro&apos;yxatdan o&apos;tish
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Hisob bormi?{" "}
            <Link href="/login" className="font-medium underline underline-offset-4">
              Kirish
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
