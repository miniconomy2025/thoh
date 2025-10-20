import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart"

export function ChartAreaStacked(
  {
    chartData, 
    fillColourA = "lightblue", 
    strokeColourA = "blue",
    fillColourB = "darkblue", 
    strokeColourB = "blue"
  }
    : 
  {
    chartData: {measure: string, collections: number, purchases: number}[], 
    fillColourA?: string,
    fillColourB?: string, 
    strokeColourA?: string,
    strokeColourB?: string
  }) {
    const chartConfig = {
        collections: {
            label: "Collections",
            color: fillColourA,
        },
        purchases: {
            label: "Purchases",
            color: fillColourB,
        },
        } satisfies ChartConfig
  return (
    <ChartContainer className="aspect-auto h-full w-full bg-card" config={chartConfig}>
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
            content={<ChartTooltipContent indicator="dot" />}
        />
        <Area
            dataKey="purchases"
            type="natural"
            fill={fillColourA}
            fillOpacity={0.4}
            stroke={strokeColourA}
            stackId="a"
        />
        <Area
            dataKey="collections"
            type="natural"
            fill={fillColourB}
            fillOpacity={0.4}
            stroke={strokeColourB}
            stackId="a"
        />
        </AreaChart>
    </ChartContainer>
  )
}
