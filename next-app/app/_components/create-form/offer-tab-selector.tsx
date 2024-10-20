"use client";

import { cn } from "@/lib/utils";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarket } from "@/store";
import { OfferForm } from "./offer-form";
import { FillOfferForm } from "./fill-offer-form";
import { MarketHashSelector } from "./market-hash-selector";

export const OfferTabSelector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { offerTab, setOfferTab } = useMarket();

  console.log("offerTab", offerTab);

  return (
    <Tabs
      value={offerTab}
      onValueChange={(value) => setOfferTab(value as "create" | "fill")}
      defaultValue="create"
      className="w-[400px]"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="create">Create Offer</TabsTrigger>
        <TabsTrigger value="fill">Fill Offer</TabsTrigger>
      </TabsList>

      <MarketHashSelector />

      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>Create Offer</CardTitle>
            <CardDescription>
              Create the offer for others to fill.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <OfferForm />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fill">
        <Card>
          <CardHeader>
            <CardTitle>Fill Offer</CardTitle>
            <CardDescription>Fill the offer created by others.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <FillOfferForm />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
});
