/**
 * Settings page for managing KiotViet API credentials and user preferences
 * Allows users to configure their KiotViet integration
 */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/providers/language-provider";
import { supabase } from "@/lib/supabase";
import { Loader2, Key, Settings, Globe, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const credentialsSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  secretKey: z.string().min(1, "Secret Key is required"),
  shopName: z.string().min(1, "Shop Name is required"),
});

type CredentialsForm = z.infer<typeof credentialsSchema>;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CredentialsForm>({
    resolver: zodResolver(credentialsSchema),
  });

  useEffect(() => {
    loadUserCredentials();
  }, []);

  const loadUserCredentials = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_credentials")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data && !error) {
        setValue("clientId", data.client_id);
        setValue("secretKey", data.secret_key);
        setValue("shopName", data.shop_name);
        setHasCredentials(true);
      }
    } catch (error) {
      console.error("Error loading credentials:", error);
    }
  };

  const onSubmit = async (data: CredentialsForm) => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const credentialData = {
        user_id: user.id,
        client_id: data.clientId,
        secret_key: data.secretKey,
        shop_name: data.shopName,
        updated_at: new Date().toISOString(),
      };

      const { error } = hasCredentials
        ? await supabase
            .from("user_credentials")
            .update(credentialData)
            .eq("user_id", user.id)
        : await supabase.from("user_credentials").insert([credentialData]);

      if (error) throw error;

      setHasCredentials(true);
      toast({
        title: "Settings saved",
        description: "Your KiotViet credentials have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("nav.settings")}
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and KiotViet integration
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* KiotViet API Credentials */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>{t("settings.apiCredentials")}</CardTitle>
            </div>
            <CardDescription>
              Enter your KiotViet API credentials to connect your store data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientId">{t("settings.clientId")}</Label>
                  <Input
                    id="clientId"
                    type="text"
                    placeholder="Enter your Client ID"
                    {...register("clientId")}
                    disabled={isLoading}
                  />
                  {errors.clientId && (
                    <p className="text-sm text-destructive">
                      {errors.clientId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretKey">{t("settings.secretKey")}</Label>
                  <Input
                    id="secretKey"
                    type="password"
                    placeholder="Enter your Secret Key"
                    {...register("secretKey")}
                    disabled={isLoading}
                  />
                  {errors.secretKey && (
                    <p className="text-sm text-destructive">
                      {errors.secretKey.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopName">{t("settings.shopName")}</Label>
                <Input
                  id="shopName"
                  type="text"
                  placeholder="Enter your Shop Name"
                  {...register("shopName")}
                  disabled={isLoading}
                />
                {errors.shopName && (
                  <p className="text-sm text-destructive">
                    {errors.shopName.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    {t("settings.save")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize the appearance of the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                id="theme"
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Language</CardTitle>
            </div>
            <CardDescription>Choose your preferred language</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Vietnamese</Label>
                <p className="text-sm text-muted-foreground">
                  Sử dụng tiếng Việt cho giao diện
                </p>
              </div>
              <Switch
                checked={language === "vi"}
                onCheckedChange={(checked) =>
                  setLanguage(checked ? "vi" : "en")
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {hasCredentials && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600">
              <div className="h-2 w-2 rounded-full bg-green-600" />
              <span className="text-sm">Connected to KiotViet API</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your dashboard is now displaying live data from your KiotViet
              store.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
