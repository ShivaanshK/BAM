import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createFormSchema } from "./create-form";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { offerFormSchema } from "./offer-form";

export const IncentiveTokenSelector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    offerForm: UseFormReturn<z.infer<typeof offerFormSchema>>;
  }
>(({ children, className, offerForm, ...props }, ref) => {
  return (
    <FormField
      control={offerForm.control}
      name="incentiveToken"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Incentive Token</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select Incentive Token" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="0x3f85506f500cb02d141bafe467cc52ad5a9d7d5a">
                USDC
              </SelectItem>
              <SelectItem value="0x3C727dd5eA4C55B7B9a85ea2f287c641481400F7">
                AAVE
              </SelectItem>
              <SelectItem value="0xef9a9eb868b456adcb5e728b71f2eb8e9454816b">
                DAI
              </SelectItem>
              <SelectItem value="0x77777Cc68b333a2256B436D675E8D257699Aa667">
                FRAX
              </SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            The token that you want to incentivize with.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
