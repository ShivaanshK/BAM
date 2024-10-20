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

export const IpfsContentIdSelector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    createForm: UseFormReturn<z.infer<typeof createFormSchema>>;
  }
>(({ children, className, createForm, ...props }, ref) => {
  return (
    <FormField
      control={createForm.control}
      name="ipfsContentID"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Common Market Types</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select Market Type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="0x3f85506f500cb02d141bafe467cc52ad5a9d7d5a">
                Twitter
              </SelectItem>
              <SelectItem value="0x77777cc68b333a2256b436d675e8d257699aa667">
                Instagram
              </SelectItem>
              <SelectItem value="0xef9a9eb868b456adcb5e728b71f2eb8e9454816b">
                Tiktok
              </SelectItem>
              <SelectItem value="0x77777Cc68b333a2256B436D675E8D257699Aa667">
                Snapchat
              </SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            It is the script that will be used to verify the content.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
