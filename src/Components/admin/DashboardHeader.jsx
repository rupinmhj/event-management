import { Calendar, TrendingUp } from "lucide-react";

export const DashboardHeader = () => {
  const currentDate = new Date().toLocaleDateString('en-NP', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground bg-gradient-primary bg-clip-text text-transparent">
            Event Dashboard
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">{currentDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-dashboard-card rounded-lg border border-border">
          <TrendingUp className="h-5 w-5 text-success" />
          <span className="text-sm font-medium text-foreground">Live Analytics</span>
        </div>
      </div>
    </div>
  );
};