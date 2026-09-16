import { getActiveFlashSales } from "@/services/checkoutService";
import { getCombos } from "@/services/comboService";

const normalizeSortOrder = (Item) => {
  const RawValue = Item?.SortOrder ?? Item?.sortOrder;
  if (RawValue === null || RawValue === undefined || RawValue === "") return null;

  const Value = Number(RawValue);
  return Number.isFinite(Value) ? Value : null;
};

const mapFlashSaleProduct = (FlashSale, Item) => {
  const FlashStock = Number(Item?.FlashStock ?? Item?.flashStock ?? 0);
  const SoldCount = Number(Item?.SoldCount ?? Item?.soldCount ?? 0);
  const RemainingStock = Math.max(0, FlashStock - SoldCount);
  const FlashPrice = Number(Item?.FlashPrice ?? Item?.flashPrice ?? 0);
  const OriginalPrice = Number(Item?.OriginalPrice ?? Item?.originalPrice ?? FlashPrice);

  return {
    ProductId: Item?.ProductId ?? Item?.productId ?? Item?.ProductVariantId ?? Item?.productVariantId ?? "",
    ProductVariantId: Item?.ProductVariantId ?? Item?.productVariantId ?? "",
    Slug: Item?.ProductSlug ?? Item?.productSlug ?? Item?.Slug ?? Item?.slug ?? Item?.Sku ?? Item?.sku ?? "",
    Name: Item?.VariantName ?? Item?.variantName ?? Item?.ProductName ?? Item?.productName ?? Item?.Sku ?? Item?.sku ?? "",
    PrimaryImageUrl: Item?.PrimaryImageUrl ?? Item?.primaryImageUrl ?? "",
    BrandName: Item?.BrandName ?? Item?.brandName ?? Item?.ProductBrandName ?? Item?.productBrandName ?? "Flash Sale",
    CampaignName: FlashSale.Name || "Flash Sale",
    BadgeText: FlashStock || SoldCount ? `Còn ${RemainingStock} sp` : "",
    ShortDescription: Item?.ShortDescription ?? Item?.shortDescription ?? `Ưu đãi thuộc ${FlashSale.Name || "chương trình flash sale"}`,
    ProductCode: Item?.Sku ?? Item?.sku ?? "",
    Status: 1,
    AvailableStock: RemainingStock,
    HasSellableVariant: RemainingStock > 0,
    MinSalePrice: FlashPrice,
    MaxSalePrice: FlashPrice,
    BaseMinSalePrice: OriginalPrice,
    BaseMaxSalePrice: OriginalPrice,
  };
};

const mapFlashSale = (Item) => ({
  Id: Item?.FlashSaleId ?? Item?.flashSaleId ?? Item?.Id ?? Item?.id ?? "",
  Name: Item?.Name ?? Item?.name ?? "Flash Sale",
  StartsAt: Item?.StartsAt ?? Item?.startsAt ?? null,
  EndsAt: Item?.EndsAt ?? Item?.endsAt ?? null,
  SortOrder: normalizeSortOrder(Item),
  Products: (Item?.Items ?? Item?.items ?? []).map((ProductItem) => mapFlashSaleProduct(Item, ProductItem)),
});

export const buildPromotionGroups = ({ FlashSales = [], Combos = [] } = {}) => {
  const GroupsByOrder = new Map();

  const ensureGroup = (SortOrder) => {
    const Key = SortOrder === null ? "unsorted" : `order-${SortOrder}`;
    if (!GroupsByOrder.has(Key)) {
      GroupsByOrder.set(Key, {
        Key,
        SortOrder,
        FlashSales: [],
        Combos: [],
      });
    }
    return GroupsByOrder.get(Key);
  };

  FlashSales.map(mapFlashSale).forEach((FlashSale) => {
    ensureGroup(FlashSale.SortOrder).FlashSales.push(FlashSale);
  });

  Combos.forEach((Combo) => {
    ensureGroup(normalizeSortOrder(Combo)).Combos.push(Combo);
  });

  return Array.from(GroupsByOrder.values()).sort((Left, Right) => {
    if (Left.SortOrder === null) return 1;
    if (Right.SortOrder === null) return -1;
    return Left.SortOrder - Right.SortOrder;
  });
};

export const getPromotionGroups = async () => {
  const [FlashSales, Combos] = await Promise.all([
    getActiveFlashSales(),
    getCombos(),
  ]);

  return buildPromotionGroups({ FlashSales, Combos });
};
