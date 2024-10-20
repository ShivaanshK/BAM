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

export const StakingTokenSelector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    createForm: UseFormReturn<z.infer<typeof createFormSchema>>;
  }
>(({ children, className, createForm, ...props }, ref) => {
  return (
    <FormField
      control={createForm.control}
      name="stakingToken"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Staking Token</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select Staking Token" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="0x3c727dd5ea4c55b7b9a85ea2f287c641481400f7">
                USDC
              </SelectItem>
              <SelectItem value="0x3f85506F500Cb02D141bAfE467Cc52aD5A9d7D5A">
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
            It will be slashed if the offer is not completed.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
