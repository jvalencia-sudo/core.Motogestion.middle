import { loadInternationalOfferDataDependencies } from "@/app/quotation/actions";
import QuotationInternationalPage from "@/app/quotation/international/international-quotation";

type SearchParams = {
  key?: string;
};

type QuotationInternationalProps = {
  searchParams: Promise<SearchParams>;
};

export default async function QuotationInternational({
  searchParams,
}: QuotationInternationalProps) {
  const { key = "" } = await searchParams;

  const offerDependencies = await loadInternationalOfferDataDependencies(key);

  return (
    <QuotationInternationalPage
      offerDependencies={offerDependencies}
      offerKey={key}
    />
  );
}
