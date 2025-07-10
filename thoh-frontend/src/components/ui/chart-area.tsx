import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./chart"

export function ChartArea(
  {
    chartData, 
    fillColour = "lightblue", 
    strokeColour = "blue"
  }
    : 
  {
    chartData: {measure: string, value: number}[], 
    fillColour?: string, 
    strokeColour?: string
  }) {
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: fillColour,
    },
} satisfies ChartConfig

  return (
    <ChartContainer 
    className="aspect-auto h-full w-full bg-card"
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
          dataKey="measure"
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
