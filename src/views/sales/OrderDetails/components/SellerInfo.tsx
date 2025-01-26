import Card from "@/components/ui/Card";
import IconText from "@/components/shared/IconText";
import { HiMail, HiCurrencyDollar } from "react-icons/hi";

type SellerInfoProps = {
  seller?: {
    name: string;
    email: string;
    amountToPay: string;
  };
};

const SellerInfo = ({ seller }: SellerInfoProps) => {
  return (
    <Card>
      <h5 className="mb-4">Vendedor</h5>
      <hr className="my-5" />
      <IconText className="mb-4">
        <span className="font-semibold">{seller?.name}</span>
      </IconText>
      <IconText
        className="mb-4"
        icon={<HiMail className="text-xl opacity-70" />}
      >
        <span className="font-semibold">{seller?.email}</span>
      </IconText>
      <IconText icon={<HiCurrencyDollar className="text-xl opacity-70" />}>
        <span className="font-semibold">{seller?.amountToPay}</span>
      </IconText>
    </Card>
  );
};

export default SellerInfo;
