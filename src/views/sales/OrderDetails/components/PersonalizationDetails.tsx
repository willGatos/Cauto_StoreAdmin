import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import IconText from "@/components/shared/IconText";
import { HiMail, HiPhone, HiExternalLink } from "react-icons/hi";
import { Link } from "react-router-dom";

const PersonalizationDetails = ({ data }) => {
  console.log("SIMPLE", data);
  return (
    <Card className="my-5">
      <h5 className="mb-4">Información de Personalización</h5>
      <hr className="my-5" />
      <div className="not-italic">
        <div className="mb-1">{data?.description}</div>
      </div>
      <hr className="my-5" />
      <div className="not-italic">
        <div className="mb-1">
          <span className="font-bold">Precio:</span> {data?.price}
        </div>
        <div className="mb-1">
          <span className="font-bold">Cantidad: </span>
          {data?.quantity}
        </div>
      </div>
      <hr className="my-5" />

      <div className="flex overflow-scroll mt-4">
        {data?.images.map((img) => (
          <img className="mx-2" src={img} />
        ))}
      </div>
    </Card>
  );
};

export default PersonalizationDetails;
