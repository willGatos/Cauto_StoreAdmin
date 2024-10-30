import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import IconText from "@/components/shared/IconText";
import { HiMail, HiPhone, HiExternalLink } from "react-icons/hi";
import { Link } from "react-router-dom";

type CustomerInfoProps = {
  data?: {
    name: string;
    email: string;
    phone: string;
    img: string;
    previousOrder: number;
    shippingAddress: {
      line1: string;
    };
  };
};

const CustomerInfo = ({ data }: CustomerInfoProps) => {
  return (
    <Card>
      <h5 className="mb-4">Cliente</h5>
      <hr className="my-5" />
      <IconText
        className="mb-4"
      >
        <span className="font-semibold">{data?.name}</span>
      </IconText>
      <IconText
        className="mb-4"
        icon={<HiMail className="text-xl opacity-70" />}
      >
        <span className="font-semibold">{data?.email}</span>
      </IconText>
      <IconText icon={<HiPhone className="text-xl opacity-70" />}>
        <span className="font-semibold">{data?.phone}</span>
      </IconText>
      <hr className="my-5" />
      <h6 className="mb-4">Información de Envío</h6>
      <address className="not-italic">
        <div className="mb-1">{data?.shippingAddress.line1}</div>
      </address>
    </Card>
  );
};

export default CustomerInfo;
