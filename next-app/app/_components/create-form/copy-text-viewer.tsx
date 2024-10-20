"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createFormSchema } from "./create-form";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAccount } from "wagmi";
import { shortAddress } from "@/components/utils";
import { Button } from "@/components/ui/button";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { cn } from "@/lib/utils";

export const CopyTextViewer = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    value: string | undefined;
  }
>(({ className, value, ...props }, ref) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  if (!!value) {
    return (
      <FormItem>
        <FormControl>
          <div
            className={cn(
              "flex w-full max-w-sm items-center space-x-2",
              className
            )}
          >
            <Input disabled={true} placeholder={shortAddress(value)} />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(value);
                setCopied(true);
              }}
              className="w-36 min-w-36"
              type="button"
            >
              {copied ? "Copied!" : "Click to Copy"}
            </Button>
          </div>
        </FormControl>
      </FormItem>
    );
  }
});
