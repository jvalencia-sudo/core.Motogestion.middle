import { loadNationalOfferDataDependencies } from "@/app/quotation/actions";
import NationalQuotationPage from "@/app/quotation/national/national-quotation";

type SearchParams = {
  key?: string;
};

type QuotationInternationalProps = {
  searchParams: Promise<SearchParams>;
};

export default async function QuotationNational({
  searchParams,
}: QuotationInternationalProps) {
  const { key = "" } = await searchParams;

  const offerDependencies = await loadNationalOfferDataDependencies(key);

  return (
    <NationalQuotationPage
      offerDependencies={offerDependencies}
      offerKey={key}
    />
  );
}
