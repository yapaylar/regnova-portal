import { useMemo, useState } from "react";

import { RESOURCES } from "@/data/mock";

export function useResources() {
  const categories = RESOURCES.map((resource) => resource.category);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] ?? "");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return RESOURCES.reduce<Record<string, typeof RESOURCES[number]["items"]>>((acc, resource) => {
      const filteredItems = query
        ? resource.items.filter((item) =>
            `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
          )
        : resource.items;
      acc[resource.category] = filteredItems;
      return acc;
    }, {});
  }, [query]);

  const getItems = useMemo(
    () => (category: string) => filtered[category] ?? [],
    [filtered],
  );

  return {
    categories,
    activeCategory,
    setActiveCategory,
    items: getItems(activeCategory),
    getItems,
    query,
    setQuery,
  };
}

