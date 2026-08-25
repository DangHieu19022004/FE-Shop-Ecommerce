import ProductDetailData from "@/data/productDetailData.json";
import i18nCommon from "@/i18n/i18nCommon";

const Text = i18nCommon.Common;

const CurrencyFormatter = new Intl.NumberFormat(Text.CurrencyLocale, {
  style: "currency",
  currency: Text.CurrencyCode,
});

const getImageUrl = (ProductId) =>
  ProductDetailData.ProductImages.find(
    (ImageItem) => ImageItem.ProductId === ProductId && ImageItem.IsPrimary,
  )?.ImageUrl ?? "";

const formatPrice = (Amount) =>
  Amount === null || Amount === undefined ? Text.ContactPrice : CurrencyFormatter.format(Amount);

export const Categories = ProductDetailData.Categories.map((CategoryItem) => ({
  Icon: CategoryItem.CategoryCode === "CLEANING" ? "cleaning_services" : "home",
  Label: CategoryItem.CategoryName,
  Query: CategoryItem.CategoryCode,
}));

export const Products = ProductDetailData.Products.map((ProductItem) => ({
  ProductId: ProductItem.ProductId,
  Slug: ProductItem.Slug,
  Title: ProductItem.ProductName,
  CategoryId: ProductItem.CategoryId,
  Price: formatPrice(ProductItem.UnitPrice),
  Sold: `${ProductItem.SoldQuantity} ${Text.SoldSuffix}`,
  Location: ProductItem.LocationName,
  Badge: ProductItem.BadgeCode,
  Stock: ProductItem.StockQuantity,
  Image: getImageUrl(ProductItem.ProductId),
}));

export const FlashProducts = Products.slice(0, 4).map((ProductItem) => ({
  ...ProductItem,
  Name: ProductItem.Title,
  Discount: Text.NewBadge,
}));
