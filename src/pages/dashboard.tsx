import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import CropSelection from "@/components/crop-selection";
import ProductivityCalculator from "@/components/productivity-calculator";
import RecommendationsSidebar from "@/components/recommendations-sidebar";
import ProfessionalSection from "@/components/professional-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, CheckCircle, MapPin, Plus } from "lucide-react";

interface DashboardStats {
  cropsAnalyzed: number;
  avgProductivity: number;
  activeRecommendations: number;
  totalArea: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: "soil_management" | "crop_management" | "pest_management";
  status: "active" | "pending" | "completed" | "scheduled";
  priority: "low" | "medium" | "high";
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recommendations } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          {/* Dashboard Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground" data-testid="text-dashboard-title">
                Dashboard de Gestão
              </h1>
              <p className="text-muted-foreground mt-2">
                Plataforma inteligente para recomendações científicas de cultivos brasileiros
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button data-testid="button-new-analysis">
                <Plus className="w-4 h-4 mr-2" />
                Nova Análise
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cultivos Analisados</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-crops-analyzed">
                  {statsLoading ? "..." : stats?.cropsAnalyzed || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2 este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produtividade Média</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-avg-productivity">
                  {statsLoading ? "..." : (stats?.avgProductivity?.toFixed(1) || "0")}
                </div>
                <p className="text-xs text-muted-foreground">
                  ton/ha
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recomendações Ativas</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-active-recommendations">
                  {statsLoading ? "..." : stats?.activeRecommendations || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  protocolos ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Área Total</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-area">
                  {statsLoading ? "..." : stats?.totalArea?.toFixed(0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  hectares
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Components */}
            <div className="lg:col-span-2 space-y-6">
              <CropSelection />
              <ProductivityCalculator />
            </div>
            
            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              <RecommendationsSidebar recommendations={recommendations} />
              <ProfessionalSection />
              
              {/* IBGE Integration Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <CardTitle className="text-lg">Dados IBGE</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Última atualização:</span>
                      <span className="text-card-foreground font-medium">PAM 2023</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cultivos disponíveis:</span>
                      <span className="text-card-foreground font-medium">30 principais</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cobertura geográfica:</span>
                      <span className="text-card-foreground font-medium">Nacional</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fonte de dados:</span>
                      <span className="text-card-foreground font-medium">SIDRA API</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-md bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground">
                      🔗 Integração em tempo real com a API do IBGE (SIDRA) para dados oficiais de produtividade agrícola municipal
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
