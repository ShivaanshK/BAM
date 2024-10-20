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
import { CreateForm } from "./create-form";
import { OfferForm } from "./create-form/offer-form";
import { OfferTabSelector } from "./create-form/offer-tab-selector";

export const TabSelector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { activeTab, setActiveTab } = useMarket();

  return (
    <Tabs defaultValue="create" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="create">Create</TabsTrigger>
        <TabsTrigger value="offer">Offer</TabsTrigger>
      </TabsList>

      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>Create</CardTitle>
            <CardDescription>Create the market.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <CreateForm />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="offer">
        <OfferTabSelector />
      </TabsContent>
    </Tabs>
  );
});
