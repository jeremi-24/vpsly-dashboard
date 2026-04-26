import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

interface OverviewData {
  name: string
  total: number
}

export function Overview({ data }: { data?: OverviewData[] }) {
  const chartData = data && data.length > 0 ? data : [
    { name: 'Jan', total: 0 },
    { name: 'Feb', total: 0 },
    { name: 'Mar', total: 0 },
    { name: 'Apr', total: 0 },
    { name: 'May', total: 0 },
    { name: 'Jun', total: 0 },
  ];

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          direction='ltr'
          stroke='#888888'
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
           cursor={{fill: 'rgba(129, 140, 248, 0.1)'}}
           contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '8px', fontSize: '10px' }}
           itemStyle={{ color: '#818cf8' }}
        />
        <Bar
          dataKey='total'
          fill='#818cf8'
          radius={[4, 4, 0, 0]}
          className='fill-indigo-500'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
