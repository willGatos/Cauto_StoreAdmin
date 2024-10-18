import Card from "@/components/ui/Card";
import { NumericFormat } from "react-number-format";
import GrowShrinkTag from "@/components/shared/GrowShrinkTag";
import { useAppSelector } from "../store";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

type StatisticCardProps = {
  data?: {
    value: number;
    growShrink: number;
  };
  label: string;
  valuePrefix?: string;
  date;
};

type StatisticProps = {
  data?: {
    revenue?: {
      value: number;
      growShrink: number;
    };
    orders?: {
      value: number;
      growShrink: number;
    };
    purchases?: {
      value: number;
      growShrink: number;
    };
  };
};

const StatisticCard = ({
  data = { value: 0, growShrink: 0 },
  label,
  valuePrefix,
  date,
}: StatisticCardProps) => {
  console.log(
    "DATESTATS",
    dayjs(date.startDate).toDate(),
    dayjs.unix(date[1]).format("DD MMM")
  );
  const data1 = dayjs.unix(date[0]).format("DD MMM");
  const data2 = dayjs.unix(date[1]).format("DD MMM");
  return (
    <Card>
      <h6 className="font-semibold mb-4 text-sm">{label}</h6>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold">
            <NumericFormat
              thousandSeparator
              displayType="text"
              value={data.value}
              prefix={valuePrefix}
            />
          </h3>
          <p>
            Desde <span className="font-semibold">{data1}</span> hasta{" "}
            <span className="font-semibold">{data2}</span>
          </p>
        </div>
        <GrowShrinkTag value={data.growShrink} suffix="%" />
      </div>
    </Card>
  );
};

const Statistic = ({ data = {} }: StatisticProps) => {
  const { startDate, endDate } = useAppSelector(
    (state) => state.salesDashboard.data
  );
  const [date, setDate] = useState([]);
  useEffect(() => {
    setDate([startDate, endDate]);
  }, [startDate, endDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <StatisticCard
        data={data.revenue}
        valuePrefix="$"
        label="Beneficios"
        date={date}
      />
      <StatisticCard data={data.orders} label="Ordenes" date={date} />
      <StatisticCard
        data={data.purchases}
        label="Productos dentro de Ordenes "
        date={date}
      />
    </div>
  );
};

export default Statistic;
