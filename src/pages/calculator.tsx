import Header from "@/components/header";
import ProductivityCalculator from "@/components/productivity-calculator";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, MapPin } from "lucide-react";

interface Calculation {
  id: string;
  municipality: string;
  state: string;
  area: string;
  ibgeYield: string;
  estimatedProduction: string;
  estimatedValue: string;
  year: number;
  createdAt: string;
}

export default function CalculatorPage() {
  const { data: calculations, isLoading } = useQuery<Calculation[]>({
    queryKey: ["/api/productivity/calculations"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground" data-testid="text-calculator-title">
              Calculadora de Produtividade
            </h1>
            <p className="text-muted-foreground mt-2">
              Calcule a produtividade agrícola com dados oficiais do IBGE
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Calculator */}
            <div className="lg:col-span-2">
              <ProductivityCalculator />
            </div>

            {/* Previous Calculations */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Cálculos Anteriores</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="animate-pulse space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded"></div>
                      ))}
                    </div>
                  ) : calculations && calculations.length > 0 ? (
                    <div className="space-y-3">
                      {calculations.slice(0, 5).map((calc) => (
                        <div
                          key={calc.id}
                          className="p-3 rounded-md bg-muted/50 border border-border"
                          data-testid={`calculation-${calc.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {calc.municipality}, {calc.state}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {calc.area} ha • {parseFloat(calc.ibgeYield).toLocaleString('pt-BR')} kg/ha
                              </div>
                              <div className="text-xs text-primary font-medium">
                                {parseFloat(calc.estimatedProduction).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ton
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {calc.year}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Calculator className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhum cálculo realizado ainda
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
