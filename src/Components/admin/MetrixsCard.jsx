import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

// Simple utility function to combine class names
const cn = (...inputs) => {
    return inputs.filter(Boolean).join(' ');
};

export const MetricsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    variant = 'primary'
}) => {
    const gradientClass = {
        primary: 'bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300',
        success: 'bg-gradient-to-r from-green-200 to-emerald-400',
        warning: 'bg-gradient-to-r from-yellow-200 to-orange-400',
        info: 'bg-gradient-to-r from-sky-300 to-indigo-300'
    }[variant];

    return (
        <Card className="bg-gradient-to-br from-white/80 to-slate-100/80 backdrop-blur-sm border-border hover:from-white/90 hover:to-slate-50/90 transition-all duration-300 hover:shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={cn("p-2 rounded-lg", gradientClass)}>
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                {trend && (
                    <p className="text-xs text-muted-foreground">
                        
                        {trend.label}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};