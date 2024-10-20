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

export const FollowerValueSelector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    offerForm: UseFormReturn<z.infer<typeof offerFormSchema>>;
  }
>(({ children, className, offerForm, ...props }, ref) => {
  return (
    <FormField
      control={offerForm.control}
      name="followerValue"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Follower Count</FormLabel>
          <FormControl>
            <Input type="number" placeholder="Follower Count" {...field} />
          </FormControl>
          <FormDescription>
            The number of followers that person making tweet want to have.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
