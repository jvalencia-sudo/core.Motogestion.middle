import { Separator } from "@/components/ui/separator";

type SectionSeparatorProps = {
  title: string;
};

const SectionSeparator: React.FC<SectionSeparatorProps> = ({ title }) => {
  return (
    <div className="relative flex items-center my-5">
      <span className="pr-4 font-bold text-lg ">{title}</span>
      <Separator className="flex-1" />
    </div>
  );
};

export default SectionSeparator;
