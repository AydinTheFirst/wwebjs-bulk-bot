import { Selection } from "@heroui/react";

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getItemsFromSelection = <T extends { key: string }>(
  items: T[],
  selection?: Selection,
): T[] => {
  if (!selection) return [];
  if (selection.toString() === "all") return items;
  const selectedItems = Array.from(selection);
  console.log(selectedItems); // returns key of selected items
  return items.filter((item) => selectedItems.includes(item.key));
};
