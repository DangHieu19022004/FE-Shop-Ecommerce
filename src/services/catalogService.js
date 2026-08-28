import axiosInstance from "@/services/axios";

const unwrapData = (Response) => Response?.Data ?? null;

export const getCategories = async () => {
  const Response = await axiosInstance.get("/categories");
  return unwrapData(Response) || [];
};

export const getBrands = async () => {
  const Response = await axiosInstance.get("/brands");
  return unwrapData(Response) || [];
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
  return unwrapData(Response) || { Items: [], Total: 0, PageIndex: 1, PageSize: 12 };
};

export const getProductBySlug = async (Slug) => {
  const Response = await axiosInstance.get(`/products/by-slug/${Slug}`);
  return unwrapData(Response);
};

export const getProductById = async (ProductId) => {
  const Response = await axiosInstance.get(`/products/${ProductId}`);
  return unwrapData(Response);
};
