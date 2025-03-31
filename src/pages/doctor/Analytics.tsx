import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, LineChart, PieChart, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Analytics() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("month");

  // Mock data - in a real app, this would come from an API
  const analyticsData = {
    revenue: {
      total: 25000,
      monthly: 5000,
      weekly: 1200,
      trend: "+15%"
    },
    patients: {
      total: 150,
      new: 25,
      returning: 125,
      trend: "+8%"
    },
    appointments: {
      total: 180,
      completed: 150,
      cancelled: 20,
      noShow: 10,
      trend: "+12%"
    },
    satisfaction: {
      rating: 4.8,
      reviews: 45,
      trend: "+5%"
    }
  };

  return (
    <AppLayout title="Analytics" showBack className="bg-gray-900">
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Track your performance metrics and patient statistics</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-white">${analyticsData.revenue.total}</CardTitle>
              <CardDescription className="text-gray-400">Total Revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400">{analyticsData.revenue.trend}</span>
                <span className="text-gray-400 ml-2">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-white">{analyticsData.patients.total}</CardTitle>
              <CardDescription className="text-gray-400">Total Patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400">{analyticsData.patients.trend}</span>
                <span className="text-gray-400 ml-2">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-white">{analyticsData.appointments.total}</CardTitle>
              <CardDescription className="text-gray-400">Total Appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400">{analyticsData.appointments.trend}</span>
                <span className="text-gray-400 ml-2">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-white">{analyticsData.satisfaction.rating}</CardTitle>
              <CardDescription className="text-gray-400">Patient Satisfaction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-green-400">{analyticsData.satisfaction.trend}</span>
                <span className="text-gray-400 ml-2">vs last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">Overview</TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-blue-600">Revenue</TabsTrigger>
            <TabsTrigger value="patients" className="data-[state=active]:bg-blue-600">Patients</TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-blue-600">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    <BarChart className="w-8 h-8 mr-2" />
                    Revenue Chart
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Patient Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    <LineChart className="w-8 h-8 mr-2" />
                    Patient Growth Chart
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Appointment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    <PieChart className="w-8 h-8 mr-2" />
                    Appointment Status Chart
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Patient Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-gray-400">
                    <PieChart className="w-8 h-8 mr-2" />
                    Demographics Chart
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="mt-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-white">Total Revenue</span>
                    </div>
                    <span className="text-white">${analyticsData.revenue.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-blue-400 mr-2" />
                      <span className="text-white">Monthly Revenue</span>
                    </div>
                    <span className="text-white">${analyticsData.revenue.monthly}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-purple-400 mr-2" />
                      <span className="text-white">Weekly Revenue</span>
                    </div>
                    <span className="text-white">${analyticsData.revenue.weekly}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="mt-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Patient Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-blue-400 mr-2" />
                      <span className="text-white">Total Patients</span>
                    </div>
                    <span className="text-white">{analyticsData.patients.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-white">New Patients</span>
                    </div>
                    <span className="text-white">{analyticsData.patients.new}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-purple-400 mr-2" />
                      <span className="text-white">Returning Patients</span>
                    </div>
                    <span className="text-white">{analyticsData.patients.returning}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="mt-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Appointment Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-blue-400 mr-2" />
                      <span className="text-white">Total Appointments</span>
                    </div>
                    <span className="text-white">{analyticsData.appointments.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-white">Completed</span>
                    </div>
                    <span className="text-white">{analyticsData.appointments.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-red-400 mr-2" />
                      <span className="text-white">Cancelled</span>
                    </div>
                    <span className="text-white">{analyticsData.appointments.cancelled}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-yellow-400 mr-2" />
                      <span className="text-white">No Shows</span>
                    </div>
                    <span className="text-white">{analyticsData.appointments.noShow}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
} 