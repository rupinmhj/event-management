import { useState, useEffect } from "react";
import { Calendar, Users, DollarSign, BarChart3 } from "lucide-react";
// import { DashboardHeader } from "/Components/admin/DashboardHeader";
import { DashboardHeader } from "../../Components/admin/DashboardHeader";
import { MetricsCard } from "../../Components/admin/MetrixsCard";
import { EventsTable } from "../../Components/admin/EventsTable";
import useAxiosAuth from "@/hooks/useAxiosAuth";
// Mock data for demonstration - replace with actual API call

// const mockDashboardData = {
//   total_events: 4,
//   total_participations: 18,
//   total_revenue: 6650.0,
//   event_wise_data: [
//     {
//       id: 10,
//       name: "Dashain Fest",
//       date: "2025-09-10",
//       is_active: true,
//       location: "Putalisadak, Kathmandu",
//       total_participants: 13,
//       total_revenue: 5800.0
//     },
//     {
//       id: 8,
//       name: "Musical Night with Purna Rai",
//       date: "2025-08-31",
//       is_active: false,
//       location: "Tinkune Ground",
//       total_participants: 3,
//       total_revenue: 0
//     },
//     {
//       id: 4,
//       name: "Pubg event version version 7",
//       date: "2025-09-02",
//       is_active: true,
//       location: "Lalitpur, Nepal",
//       total_participants: 2,
//       total_revenue: 850.0
//     },
//     {
//       id: 1,
//       name: "PMNC South Asia",
//       date: "2025-08-07",
//       is_active: false,
//       location: "Youtube",
//       total_participants: 0,
//       total_revenue: 0
//     }
//   ]
// };

export const DashboardAdmin = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = useAxiosAuth();
  useEffect(() => {

    const fetchDashboardData = async () => {
      try {
        // Replace this with actual API call to /api/event/admin-dashboard/
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
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
    <div className="min-h-screen bg-dashboard-bg px-6 pt-16">
      <div className="max-w-7xl mx-auto">
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

