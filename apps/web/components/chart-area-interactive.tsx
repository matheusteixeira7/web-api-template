"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@workspace/ui/components/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"

export const description = "An interactive area chart"

const chartData = [
  { date: "2024-04-01", completed: 22, noShows: 2 },
  { date: "2024-04-02", completed: 19, noShows: 1 },
  { date: "2024-04-03", completed: 24, noShows: 3 },
  { date: "2024-04-04", completed: 21, noShows: 2 },
  { date: "2024-04-05", completed: 26, noShows: 1 },
  { date: "2024-04-06", completed: 12, noShows: 0 },
  { date: "2024-04-07", completed: 8, noShows: 1 },
  { date: "2024-04-08", completed: 23, noShows: 2 },
  { date: "2024-04-09", completed: 20, noShows: 3 },
  { date: "2024-04-10", completed: 25, noShows: 1 },
  { date: "2024-04-11", completed: 22, noShows: 2 },
  { date: "2024-04-12", completed: 27, noShows: 2 },
  { date: "2024-04-13", completed: 14, noShows: 1 },
  { date: "2024-04-14", completed: 9, noShows: 0 },
  { date: "2024-04-15", completed: 21, noShows: 3 },
  { date: "2024-04-16", completed: 24, noShows: 2 },
  { date: "2024-04-17", completed: 23, noShows: 1 },
  { date: "2024-04-18", completed: 26, noShows: 2 },
  { date: "2024-04-19", completed: 28, noShows: 3 },
  { date: "2024-04-20", completed: 15, noShows: 1 },
  { date: "2024-04-21", completed: 10, noShows: 0 },
  { date: "2024-04-22", completed: 22, noShows: 2 },
  { date: "2024-04-23", completed: 25, noShows: 1 },
  { date: "2024-04-24", completed: 24, noShows: 2 },
  { date: "2024-04-25", completed: 21, noShows: 3 },
  { date: "2024-04-26", completed: 27, noShows: 1 },
  { date: "2024-04-27", completed: 13, noShows: 2 },
  { date: "2024-04-28", completed: 8, noShows: 0 },
  { date: "2024-04-29", completed: 23, noShows: 2 },
  { date: "2024-04-30", completed: 26, noShows: 1 },
  { date: "2024-05-01", completed: 20, noShows: 2 },
  { date: "2024-05-02", completed: 24, noShows: 3 },
  { date: "2024-05-03", completed: 25, noShows: 1 },
  { date: "2024-05-04", completed: 14, noShows: 1 },
  { date: "2024-05-05", completed: 9, noShows: 0 },
  { date: "2024-05-06", completed: 22, noShows: 2 },
  { date: "2024-05-07", completed: 21, noShows: 1 },
  { date: "2024-05-08", completed: 26, noShows: 2 },
  { date: "2024-05-09", completed: 23, noShows: 3 },
  { date: "2024-05-10", completed: 28, noShows: 2 },
  { date: "2024-05-11", completed: 15, noShows: 1 },
  { date: "2024-05-12", completed: 10, noShows: 0 },
  { date: "2024-05-13", completed: 24, noShows: 2 },
  { date: "2024-05-14", completed: 22, noShows: 1 },
  { date: "2024-05-15", completed: 25, noShows: 2 },
  { date: "2024-05-16", completed: 27, noShows: 1 },
  { date: "2024-05-17", completed: 26, noShows: 2 },
  { date: "2024-05-18", completed: 13, noShows: 1 },
  { date: "2024-05-19", completed: 8, noShows: 0 },
  { date: "2024-05-20", completed: 21, noShows: 2 },
  { date: "2024-05-21", completed: 23, noShows: 1 },
  { date: "2024-05-22", completed: 24, noShows: 3 },
  { date: "2024-05-23", completed: 22, noShows: 2 },
  { date: "2024-05-24", completed: 27, noShows: 1 },
  { date: "2024-05-25", completed: 14, noShows: 1 },
  { date: "2024-05-26", completed: 9, noShows: 0 },
  { date: "2024-05-27", completed: 25, noShows: 2 },
  { date: "2024-05-28", completed: 23, noShows: 1 },
  { date: "2024-05-29", completed: 26, noShows: 2 },
  { date: "2024-05-30", completed: 24, noShows: 3 },
  { date: "2024-05-31", completed: 28, noShows: 1 },
  { date: "2024-06-01", completed: 15, noShows: 1 },
  { date: "2024-06-02", completed: 10, noShows: 0 },
  { date: "2024-06-03", completed: 22, noShows: 2 },
  { date: "2024-06-04", completed: 21, noShows: 1 },
  { date: "2024-06-05", completed: 25, noShows: 2 },
  { date: "2024-06-06", completed: 24, noShows: 1 },
  { date: "2024-06-07", completed: 27, noShows: 2 },
  { date: "2024-06-08", completed: 14, noShows: 1 },
  { date: "2024-06-09", completed: 9, noShows: 0 },
  { date: "2024-06-10", completed: 23, noShows: 2 },
  { date: "2024-06-11", completed: 22, noShows: 1 },
  { date: "2024-06-12", completed: 26, noShows: 2 },
  { date: "2024-06-13", completed: 25, noShows: 3 },
  { date: "2024-06-14", completed: 28, noShows: 1 },
  { date: "2024-06-15", completed: 15, noShows: 1 },
  { date: "2024-06-16", completed: 10, noShows: 0 },
  { date: "2024-06-17", completed: 24, noShows: 2 },
  { date: "2024-06-18", completed: 21, noShows: 1 },
  { date: "2024-06-19", completed: 25, noShows: 2 },
  { date: "2024-06-20", completed: 23, noShows: 1 },
  { date: "2024-06-21", completed: 27, noShows: 2 },
  { date: "2024-06-22", completed: 14, noShows: 1 },
  { date: "2024-06-23", completed: 9, noShows: 0 },
  { date: "2024-06-24", completed: 22, noShows: 2 },
  { date: "2024-06-25", completed: 24, noShows: 1 },
  { date: "2024-06-26", completed: 26, noShows: 2 },
  { date: "2024-06-27", completed: 25, noShows: 1 },
  { date: "2024-06-28", completed: 28, noShows: 2 },
  { date: "2024-06-29", completed: 15, noShows: 1 },
  { date: "2024-06-30", completed: 10, noShows: 0 },
]

const chartConfig = {
  appointments: {
    label: "Consultas",
  },
  completed: {
    label: "Realizadas",
    color: "var(--primary)",
  },
  noShows: {
    label: "Faltas",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Consultas</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total dos últimos 3 meses
          </span>
          <span className="@[540px]/card:hidden">Últimos 3 meses</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 dias</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 dias</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Selecionar período"
            >
              <SelectValue placeholder="Últimos 3 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 dias
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 dias
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-completed)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillNoShows" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-noShows)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-noShows)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("pt-BR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("pt-BR", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="noShows"
              type="natural"
              fill="url(#fillNoShows)"
              stroke="var(--color-noShows)"
              stackId="a"
            />
            <Area
              dataKey="completed"
              type="natural"
              fill="url(#fillCompleted)"
              stroke="var(--color-completed)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
