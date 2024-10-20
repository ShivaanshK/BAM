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

export const IncentiveValueSelector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    offerForm: UseFormReturn<z.infer<typeof offerFormSchema>>;
  }
>(({ children, className, offerForm, ...props }, ref) => {
  return (
    <FormField
      control={offerForm.control}
      name="incentiveValue"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Incentive Value</FormLabel>
          <FormControl>
            <Input placeholder="Incentive Value" {...field} />
          </FormControl>
          <FormDescription>
            This is the amount of tokens you want to incentivize with.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
