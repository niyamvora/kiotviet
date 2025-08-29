/**
 * Language toggle component for switching between English and Vietnamese
 * Displays country flags and manages language state
 */

"use client";

import * as React from "react";
import Image from "next/image";
import { useLanguage } from "@/components/providers/language-provider";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setLanguage(language === "en" ? "vi" : "en")}
      className="relative overflow-hidden"
    >
      {language === "en" ? (
        <Image
          src="https://flagcdn.com/w40/us.png"
          alt="English"
          width={20}
          height={15}
          className="object-cover"
        />
      ) : (
        <Image
          src="https://flagcdn.com/w40/vn.png"
          alt="Vietnamese"
          width={20}
          height={15}
          className="object-cover"
        />
      )}
      <span className="sr-only">Toggle language</span>
    </Button>
  );
}
