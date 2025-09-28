import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: "soil_management" | "crop_management" | "pest_management";
  status: "active" | "pending" | "completed" | "scheduled";
  priority: "low" | "medium" | "high";
}

interface Props {
  recommendations?: Recommendation[];
}

export default function RecommendationsSidebar({ recommendations = [] }: Props) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary text-primary-foreground";
      case "pending":
        return "bg-accent text-accent-foreground";
      case "scheduled":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "pending":
        return "Pendente";
      case "scheduled":
        return "Programado";
      case "completed":
        return "Concluído";
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recomendações Ativas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.length > 0 ? (
            recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-md border border-border hover:border-primary/50 transition-colors"
                data-testid={`recommendation-${rec.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-card-foreground">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rec.description}
                    </p>
                  </div>
                  <Badge
                    className={`ml-2 ${getStatusColor(rec.status)}`}
                    data-testid={`status-${rec.status}`}
                  >
                    <span className="flex items-center space-x-1">
                      {getStatusIcon(rec.status)}
                      <span>{getStatusLabel(rec.status)}</span>
                    </span>
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma recomendação disponível
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione um cultivo e protocolo para gerar recomendações
              </p>
            </div>
          )}
        </div>

        <Link href="/recommendations">
          <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-recommendations">
            Ver Todas as Recomendações
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
