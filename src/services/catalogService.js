import axiosInstance from "@/services/axios";

const unwrapData = (Response) => Response?.Data ?? Response?.data ?? null;

const mapLookupItem = (Item) => ({
  Id: Item?.Id ?? Item?.id ?? "",
  Name: Item?.Name ?? Item?.name ?? "",
  Slug: Item?.Slug ?? Item?.slug ?? "",
  Description: Item?.Description ?? Item?.description ?? null,
});

const mapProductVariant = (Item) => ({
  ProductVariantId: Item?.ProductVariantId ?? Item?.productVariantId ?? "",
  Name: Item?.Name ?? Item?.name ?? "",
  Sku: Item?.Sku ?? Item?.sku ?? "",
  SalePrice: Item?.SalePrice ?? Item?.salePrice ?? 0,
  CostPrice: Item?.CostPrice ?? Item?.costPrice ?? 0,
  Color: Item?.Color ?? Item?.color ?? null,
  Size: Item?.Size ?? Item?.size ?? null,
  AvailableStock: Number(Item?.AvailableStock ?? Item?.availableStock ?? 0),
  Status: Number(Item?.Status ?? Item?.status ?? 1),
  IsDefault: Item?.IsDefault ?? Item?.isDefault ?? false,
});

const mapProductImage = (Item) => ({
  ProductImageId: Item?.ProductImageId ?? Item?.productImageId ?? "",
  ImageUrl: Item?.ImageUrl ?? Item?.imageUrl ?? "",
  AltText: Item?.AltText ?? Item?.altText ?? null,
  SortOrder: Item?.SortOrder ?? Item?.sortOrder ?? 0,
  IsPrimary: Item?.IsPrimary ?? Item?.isPrimary ?? false,
});

const mapProductItem = (Item) => ({
  ProductId: Item?.ProductId ?? Item?.productId ?? "",
  Name: Item?.Name ?? Item?.name ?? "",
  Slug: Item?.Slug ?? Item?.slug ?? "",
  ProductCode: Item?.ProductCode ?? Item?.productCode ?? "",
  CategoryId: Item?.CategoryId ?? Item?.categoryId ?? "",
  CategoryName: Item?.CategoryName ?? Item?.categoryName ?? "",
  BrandId: Item?.BrandId ?? Item?.brandId ?? null,
  BrandName: Item?.BrandName ?? Item?.brandName ?? null,
  ShortDescription: Item?.ShortDescription ?? Item?.shortDescription ?? null,
  Description: Item?.Description ?? Item?.description ?? null,
  Status: Number(Item?.Status ?? Item?.status ?? 1),
  AvailableStock: Number(Item?.AvailableStock ?? Item?.availableStock ?? 0),
  HasSellableVariant: Item?.HasSellableVariant ?? Item?.hasSellableVariant ?? false,
  MinSalePrice: Number(Item?.UserMinSalePrice ?? Item?.userMinSalePrice ?? Item?.MinSalePrice ?? Item?.minSalePrice ?? 0),
  MaxSalePrice: Number(Item?.UserMaxSalePrice ?? Item?.userMaxSalePrice ?? Item?.MaxSalePrice ?? Item?.maxSalePrice ?? 0),
  BaseMinSalePrice: Number(Item?.BaseMinSalePrice ?? Item?.baseMinSalePrice ?? Item?.MinSalePrice ?? Item?.minSalePrice ?? 0),
  BaseMaxSalePrice: Number(Item?.BaseMaxSalePrice ?? Item?.baseMaxSalePrice ?? Item?.MaxSalePrice ?? Item?.maxSalePrice ?? 0),
  UserMinSalePrice: Item?.UserMinSalePrice ?? Item?.userMinSalePrice ?? null,
  UserMaxSalePrice: Item?.UserMaxSalePrice ?? Item?.userMaxSalePrice ?? null,
  PrimaryImageUrl: Item?.PrimaryImageUrl ?? Item?.primaryImageUrl ?? null,
  Variants: Array.isArray(Item?.Variants ?? Item?.variants) ? (Item?.Variants ?? Item?.variants).map(mapProductVariant) : [],
  Images: Array.isArray(Item?.Images ?? Item?.images) ? (Item?.Images ?? Item?.images).map(mapProductImage) : [],
});


export const getCategories = async () => {
  const Response = await axiosInstance.get("/categories");
  const Data = unwrapData(Response);
  return Array.isArray(Data) ? Data.map(mapLookupItem) : [];
};

export const getBrands = async () => {
  const Response = await axiosInstance.get("/brands");
  const Data = unwrapData(Response);
  return Array.isArray(Data) ? Data.map(mapLookupItem) : [];
};

export const getProducts = async (Params = {}) => {
  const Query = {
    PageIndex: Params.PageIndex || 1,
    PageSize: Params.PageSize || 12,
  };

  if (Params.Search) Query.Search = Params.Search;
  if (Params.CategoryId) Query.CategoryId = Params.CategoryId;
  if (Params.BrandId) Query.BrandId = Params.BrandId;
  if (Params.MinPrice !== null && Params.MinPrice !== undefined && Params.MinPrice !== "") Query.MinPrice = Params.MinPrice;
  if (Params.MaxPrice !== null && Params.MaxPrice !== undefined && Params.MaxPrice !== "") Query.MaxPrice = Params.MaxPrice;
  if (Params.Sort) Query.Sort = Params.Sort;

  const Response = await axiosInstance.get("/products", { params: Query });
  const Data = unwrapData(Response);
  return {
    Items: Array.isArray(Data?.Items ?? Data?.items) ? (Data.Items ?? Data.items).map(mapProductItem) : [],
    Total: Data?.Total ?? Data?.total ?? 0,
    PageIndex: Data?.PageIndex ?? Data?.pageIndex ?? 1,
    PageSize: Data?.PageSize ?? Data?.pageSize ?? 12,
  };
};

export const getProductBySlug = async (Slug) => {
  const Response = await axiosInstance.get(`/products/by-slug/${Slug}`);
  const Data = unwrapData(Response);
  return Data ? mapProductItem(Data) : null;
};

export const getProductById = async (ProductId) => {
  const Response = await axiosInstance.get(`/products/${ProductId}`);
  const Data = unwrapData(Response);
  return Data ? mapProductItem(Data) : null;
};
