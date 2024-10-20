"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { offerFormSchema } from "./offer-form";
import { z } from "zod";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { claimFormSchema } from "./claim-form";

export const TweetUrlValueSelector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    claimForm: UseFormReturn<z.infer<typeof claimFormSchema>>;
  }
>(({ children, className, claimForm, ...props }, ref) => {
  return (
    <FormField
      control={claimForm.control}
      name="tweetUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tweet Url</FormLabel>
          <FormControl>
            <Input placeholder="Enter Url" {...field} />
          </FormControl>
          <FormDescription>
            Enter the tweet url you want to claim.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
