import { useState, useEffect } from 'react'
import { echo } from '@/lib/echo'
import { Progress } from '@/components/ui/progress'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Cpu, Database, HardDrive, CircleDot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface ServerMetricsCardProps {
    serverId: number
}

interface Metrics {
    system: {
        memory: { mem_used: number; mem_total: number };
        cpu: { cpu_usage: number };
        disk: { disk_usage: string };
    };
    timestamp: string;
}

export function ServerMetricsCard({ serverId }: ServerMetricsCardProps) {
    const [metrics, setMetrics] = useState<Metrics | null>(null)
    const [isLive, setIsLive] = useState(false)

    useEffect(() => {
        const channel = echo.channel(`server.${serverId}.metrics`)
            .listen('.metrics.updated', (data: Metrics) => {
                setMetrics(data)
                setIsLive(true)
                // Petit effet visuel pour indiquer la réception
                setTimeout(() => setIsLive(false), 1000)
            })

        return () => {
            echo.leaveChannel(`server.${serverId}.metrics`)
        }
    }, [serverId])

    if (!metrics) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border-white/5 bg-card/30 backdrop-blur-sm p-4 space-y-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-1.5 w-full rounded" />
                    </Card>
                ))}
            </div>
        )
    }

    const { memory, cpu, disk } = metrics.system
    const memPerc = Math.round((memory.mem_used / memory.mem_total) * 100)
    const cpuPerc = Math.round(cpu.cpu_usage || 0)
    const diskPerc = parseInt(disk.disk_usage || '0')

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CPU */}
            <Card className="border-white/5 bg-card/30 backdrop-blur-sm relative overflow-hidden">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Cpu className="h-3 w-3" /> CPU
                    </CardTitle>
                    <CircleDot className={cn("h-2 w-2 transition-colors", isLive ? "text-green-500" : "text-muted-foreground/20")} />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold mb-2">{cpuPerc}%</div>
                    <Progress value={cpuPerc} className="h-1.5" />
                </CardContent>
            </Card>

            {/* RAM */}
            <Card className="border-white/5 bg-card/30 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Database className="h-3 w-3" /> RAM
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="flex items-end justify-between mb-2">
                        <div className="text-2xl font-bold">{memPerc}%</div>
                        <div className="text-[10px] text-muted-foreground mb-1">
                            {Math.round(memory.mem_used / 1024 * 10) / 10} / {Math.round(memory.mem_total / 1024 * 10) / 10} GB
                        </div>
                    </div>
                    <Progress value={memPerc} className="h-1.5" />
                </CardContent>
            </Card>

            {/* DISK */}
            <Card className="border-white/5 bg-card/30 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <HardDrive className="h-3 w-3" /> DISQUE
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold mb-2">{disk.disk_usage}</div>
                    <Progress value={diskPerc} className="h-1.5" />
                </CardContent>
            </Card>
        </div>
    )
}
