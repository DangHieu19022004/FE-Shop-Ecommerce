import axiosInstance from "@/services/axios";

const unwrapData = (Response) => Response?.Data ?? null;

const mapComboItem = (Item) => ({
  ComboItemId: Item?.ComboItemId || "",
  ProductId: Item?.ProductId || "",
  ProductVariantId: Item?.ProductVariantId || "",
  ProductSlug: Item?.ProductSlug || "",
  ProductCode: Item?.ProductCode || "",
  ProductName: Item?.ProductName || "",
  VariantName: Item?.VariantName || "",
  Quantity: Number(Item?.Quantity || 0),
  UnitPrice: Number(Item?.UnitPrice || 0),
  ImageUrl: Item?.ImageUrl || "",
  IsRequired: Boolean(Item?.IsRequired),
  AvailableStock: Number(Item?.AvailableStock || 0),
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
  IsActive: Boolean(Item?.IsActive ?? true),
  Discounts: Array.isArray(Item?.Discounts) ? Item.Discounts : [],
  Items: Array.isArray(Item?.Items) ? Item.Items.map(mapComboItem) : [],
});

export const getComboCategories = async () => {
  const Response = await axiosInstance.get("/combos/categories");
  return unwrapData(Response) || [];
};

export const getCombos = async ({ CategoryCode = "ALL", Search = "" } = {}) => {
  const Response = await axiosInstance.get("/combos");
  const Combos = (unwrapData(Response) || []).map(mapCombo);
  const NormalizedSearch = String(Search).trim().toLocaleLowerCase("vi");

  return Combos
    .filter((Item) => CategoryCode === "ALL" || Item.CategoryCode === CategoryCode)
    .filter((Item) => !NormalizedSearch
      || Item.Name.toLocaleLowerCase("vi").includes(NormalizedSearch)
      || Item.Description.toLocaleLowerCase("vi").includes(NormalizedSearch)
      || Item.Items.some((ComboItem) => ComboItem.ProductName.toLocaleLowerCase("vi").includes(NormalizedSearch)));
};

export const getComboBySlug = async (Slug) => {
  const Response = await axiosInstance.get(`/combos/by-slug/${Slug}`);
  const Combo = unwrapData(Response);
  return Combo ? mapCombo(Combo) : null;
};

// ponytail: keep frontend-side search/category filter after fetch; move to backend query params when combo list grows big.
