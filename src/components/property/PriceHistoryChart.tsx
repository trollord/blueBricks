"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatPrice } from "@/lib/utils/formatters";
import { formatDate } from "@/lib/utils/formatters";

interface PricePoint {
  price: number;
  recordedAt: string | Date;
  source: string;
}

interface Props {
  data: PricePoint[];
  listingType: string;
}

export default function PriceHistoryChart({ data, listingType }: Props) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg text-sm text-gray-400">
        Not enough data to show price history yet.
      </div>
    );
  }

  const chartData = data.map((point) => ({
    date: formatDate(point.recordedAt),
    price: point.price,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatPrice(v)}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip
          formatter={(value) => [
            `${formatPrice(Number(value))}${listingType === "RENT" ? "/mo" : ""}`,
            "Price",
          ]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "12px",
          }}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ fill: "#2563eb", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
