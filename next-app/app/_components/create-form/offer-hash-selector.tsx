"use client";

import { z } from "zod";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { fillOfferFormSchema } from "./fill-offer-form";

export const OfferHashSelector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    fillOfferForm: UseFormReturn<z.infer<typeof fillOfferFormSchema>>;
  }
>(({ children, className, fillOfferForm, ...props }, ref) => {
  return (
    <FormField
      control={fillOfferForm.control}
      name="offerHash"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Offer Hash</FormLabel>
          <FormControl>
            <Input placeholder="Offer Hash" {...field} />
          </FormControl>
          <FormDescription>
            The offer hash is the hash of the offer you want to fill.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
