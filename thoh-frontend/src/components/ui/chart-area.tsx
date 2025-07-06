import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./chart"

export const description = "A simple area chart"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartArea(
  {
    chartData, 
    fillColour = "lightblue", 
    strokeColour = "blue"
  }
    : 
  {
    chartData: {month: string, value: number}[], 
    fillColour?: string, 
    strokeColour?: string
  }) {
  return (
    <ChartContainer 
    className="aspect-auto h-full w-full"
    config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          dataKey="value"
          type="natural"
          fillOpacity={0.4}
          fill={fillColour}
          stroke={strokeColour}
        />
      </AreaChart>
    </ChartContainer>
  )
}
