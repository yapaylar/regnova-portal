"use client";

import { Download, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResources } from "@/hooks/use-resources";

export default function ResourcesPage() {
  const { categories, activeCategory, setActiveCategory, getItems, query, setQuery } = useResources();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>Download SOPs, guidelines, and forms to support compliance workflows.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources"
              className="w-full pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex flex-col gap-4">
            <TabsList className="flex w-full flex-wrap gap-3">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => {
              const items = getItems(category)
              return (
                <TabsContent key={category} value={category} className="space-y-4">
                  {items.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {items.map((item) => (
                        <Card key={item.title} className="flex h-full flex-col justify-between">
                          <CardHeader>
                            <CardTitle className="text-base">{item.title}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                          </CardHeader>
                          <CardFooter className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">{item.size}</span>
                            <Button size="sm" asChild>
                              <a href={item.url} target="_blank" rel="noreferrer">
                                <Download className="mr-2 size-4" />
                                Download
                              </a>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed bg-muted/30 p-10 text-center text-sm text-muted-foreground">
                      No records found
                    </div>
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

