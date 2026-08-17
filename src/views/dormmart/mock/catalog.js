import ProductDetailData from "@/data/productDetailData.json";

const CurrencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const getImageUrl = (ProductId) =>
  ProductDetailData.ProductImages.find(
    (ImageItem) => ImageItem.ProductId === ProductId && ImageItem.IsPrimary,
  )?.ImageUrl ?? "";

const formatPrice = (Amount) =>
  Amount === null || Amount === undefined ? "Liên hệ" : CurrencyFormatter.format(Amount);

export const Categories = ProductDetailData.Categories.map((CategoryItem) => ({
  Icon: CategoryItem.CategoryCode === "CLEANING" ? "cleaning_services" : "home",
  Label: CategoryItem.CategoryName,
  Query: CategoryItem.CategoryCode,
}));

export const Products = ProductDetailData.Products.map((ProductItem) => ({
  Slug: ProductItem.Slug,
  Title: ProductItem.ProductName,
  CategoryId: ProductItem.CategoryId,
  Price: formatPrice(ProductItem.UnitPrice),
  Sold: `${ProductItem.SoldQuantity} đã bán`,
  Location: ProductItem.LocationName,
  Badge: ProductItem.BadgeCode,
  Stock: ProductItem.StockQuantity,
  Image: getImageUrl(ProductItem.ProductId),
}));

export const FlashProducts = Products.slice(0, 4).map((ProductItem) => ({
  ...ProductItem,
  Name: ProductItem.Title,
  Discount: "Mới",
}));
