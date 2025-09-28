import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ProfessionalSection from "@/components/professional-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { MapPin, Star, FileText } from "lucide-react";

interface GeospatialAnalysis {
  id: string;
  latitude: string;
  longitude: string;
  fileName?: string;
  analysisResults: string;
  createdAt: string;
}

export default function Professional() {
  const { user } = useAuth();
  
  const { data: analyses, isLoading } = useQuery<GeospatialAnalysis[]>({
    queryKey: ["/api/professional/analyses"],
    enabled: !!user?.isPremium,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center space-x-2">
                <Star className="h-8 w-8 text-accent" />
                <span data-testid="text-professional-title">Seção Profissional</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                Análises geoespaciais avançadas e recursos premium
              </p>
            </div>
            {user?.isPremium && (
              <Badge className="bg-accent text-accent-foreground">
                Usuário Premium
              </Badge>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Professional Tools */}
            <div className="lg:col-span-2">
              <ProfessionalSection />
              
              {user?.isPremium && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Recursos Premium Disponíveis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <MapPin className="h-8 w-8 text-primary mb-2" />
                        <h3 className="font-semibold text-card-foreground">Análise Geoespacial</h3>
                        <p className="text-sm text-muted-foreground">
                          Upload de arquivos KML/KMZ e análise por coordenadas
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                        <FileText className="h-8 w-8 text-accent mb-2" />
                        <h3 className="font-semibold text-card-foreground">Relatórios Detalhados</h3>
                        <p className="text-sm text-muted-foreground">
                          Relatórios completos com dados históricos
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                        <Star className="h-8 w-8 text-secondary mb-2" />
                        <h3 className="font-semibold text-card-foreground">Dados Históricos IBGE</h3>
                        <p className="text-sm text-muted-foreground">
                          Acesso a séries históricas completas
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <MapPin className="h-8 w-8 text-green-600 mb-2" />
                        <h3 className="font-semibold text-card-foreground">Suporte Prioritário</h3>
                        <p className="text-sm text-muted-foreground">
                          Atendimento especializado para usuários premium
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Previous Analyses */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Análises Anteriores</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!user?.isPremium ? (
                    <div className="text-center py-6">
                      <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Upgrade para premium para ver suas análises
                      </p>
                    </div>
                  ) : isLoading ? (
                    <div className="animate-pulse space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded"></div>
                      ))}
                    </div>
                  ) : analyses && analyses.length > 0 ? (
                    <div className="space-y-3">
                      {analyses.slice(0, 5).map((analysis) => {
                        let results;
                        try {
                          results = JSON.parse(analysis.analysisResults);
                        } catch {
                          results = {};
                        }
                        
                        return (
                          <div
                            key={analysis.id}
                            className="p-3 rounded-md bg-muted/50 border border-border"
                            data-testid={`analysis-${analysis.id}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  {analysis.fileName ? (
                                    <FileText className="h-4 w-4 text-accent" />
                                  ) : (
                                    <MapPin className="h-4 w-4 text-primary" />
                                  )}
                                  <span className="text-sm font-medium">
                                    {analysis.fileName || `${analysis.latitude}, ${analysis.longitude}`}
                                  </span>
                                </div>
                                {results.soilType && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Solo: {results.soilType}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  {new Date(analysis.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                Concluída
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma análise realizada ainda
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
