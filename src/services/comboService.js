import ComboCatalog from "@/data/comboCatalog.json";

const mapComboItem = (Item) => ({
  ComboItemId: Item?.ComboItemId || "",
  ProductId: Item?.ProductId || "",
  ProductVariantId: Item?.ProductVariantId || "",
  ProductSlug: Item?.ProductSlug || "",
  ProductCode: Item?.ProductCode || "",
  ProductName: Item?.ProductName || "",
  Quantity: Number(Item?.Quantity || 0),
  UnitPrice: Number(Item?.UnitPrice || 0),
  ImageUrl: Item?.ImageUrl || "",
  IsRequired: Boolean(Item?.IsRequired),
});

const mapCombo = (Item) => ({
  ComboId: Item?.ComboId || "",
  ComboCode: Item?.ComboCode || "",
  Name: Item?.Name || "",
  Slug: Item?.Slug || "",
  CategoryCode: Item?.CategoryCode || "",
  CategoryName: Item?.CategoryName || "",
  Description: Item?.Description || "",
  Badge: Item?.Badge || "",
  Icon: Item?.Icon || "inventory_2",
  Theme: Item?.Theme || "BLUE",
  OriginalPrice: Number(Item?.OriginalPrice || 0),
  ComboPrice: Number(Item?.ComboPrice || 0),
  ImageUrl: Item?.ImageUrl || "",
  Rating: Number(Item?.Rating || 0),
  SoldCount: Number(Item?.SoldCount || 0),
  IsFeatured: Boolean(Item?.IsFeatured),
  Items: Array.isArray(Item?.Items) ? Item.Items.map(mapComboItem) : [],
});

export const getComboCategories = async () =>
  (ComboCatalog.Categories || []).map((Item) => ({ ...Item }));

export const getCombos = async ({ CategoryCode = "ALL", Search = "" } = {}) => {
  const NormalizedSearch = String(Search).trim().toLocaleLowerCase("vi");
  return (ComboCatalog.Combos || [])
    .map(mapCombo)
    .filter((Item) => CategoryCode === "ALL" || Item.CategoryCode === CategoryCode)
    .filter((Item) => !NormalizedSearch
      || Item.Name.toLocaleLowerCase("vi").includes(NormalizedSearch)
      || Item.Description.toLocaleLowerCase("vi").includes(NormalizedSearch)
      || Item.Items.some((ComboItem) => ComboItem.ProductName.toLocaleLowerCase("vi").includes(NormalizedSearch)));
};

export const getComboBySlug = async (Slug) => {
  const TargetCombo = (ComboCatalog.Combos || []).find((Item) => Item.Slug === Slug);
  return TargetCombo ? mapCombo(TargetCombo) : null;
};
