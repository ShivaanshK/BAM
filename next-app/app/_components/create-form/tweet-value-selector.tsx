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

export const TweetValueSelector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    offerForm: UseFormReturn<z.infer<typeof offerFormSchema>>;
  }
>(({ children, className, offerForm, ...props }, ref) => {
  return (
    <FormField
      control={offerForm.control}
      name="tweetValue"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tweet Text</FormLabel>
          <FormControl>
            <Input placeholder="Tweet Text" {...field} />
          </FormControl>
          <FormDescription>
            The text that you want to be tweeted.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
