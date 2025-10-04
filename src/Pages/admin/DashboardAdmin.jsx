import { useState, useEffect } from "react";
import { Calendar, Users, DollarSign, BarChart3 } from "lucide-react";
import { DashboardHeader } from "../../Components/admin/DashboardHeader";
import { MetricsCard } from "../../Components/admin/MetrixsCard";
import { EventsTable } from "../../Components/admin/EventsTable";
import useAxiosAuth from "@/hooks/useAxiosAuth";


export const DashboardAdmin = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = useAxiosAuth();
  useEffect(() => {

    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/api/event/admin-dashboard/');
        console.log('____Dashboard-admin', response.data);

        // Using mock data for now
        await new Promise(resolve => setTimeout(resolve, 100));
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">Unable to fetch dashboard data</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-dashboard-bg px-6 pt-20">
      <div className="max-w-7xl mx-auto ">
        <DashboardHeader />

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            className='bbb'
            title="Total Events"
            value={dashboardData.total_events}
            icon={Calendar}
            variant="primary"
          />
          <MetricsCard
            title="Total Participants"
            value={dashboardData.total_participations}
            icon={Users}
            variant="info"
          />
          <MetricsCard
            title="Total Revenue"
            value={formatCurrency(dashboardData.total_revenue)}
            icon={DollarSign}
            variant="success"
          />
          <MetricsCard
            title="Active Events"
            value={dashboardData.event_wise_data.filter(e => e.is_active).length}
            icon={BarChart3}
            variant="warning"
          />
        </div>

        {/* Events Table */}
        <EventsTable events={dashboardData.event_wise_data} />
      </div>
    </div>
  );
};

