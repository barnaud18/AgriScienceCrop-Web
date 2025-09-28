import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Clock, AlertCircle, Trash2, Edit } from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: "soil_management" | "crop_management" | "pest_management";
  status: "active" | "pending" | "completed" | "scheduled";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export default function Recommendations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/recommendations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({
        title: "Recomendação removida",
        description: "A recomendação foi removida com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/recommendations/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({
        title: "Status atualizado",
        description: "O status da recomendação foi atualizado.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
      case "completed":
        return "bg-green-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "soil_management":
        return "Manejo de Solo";
      case "crop_management":
        return "Gestão do Cultivo";
      case "pest_management":
        return "Manejo Integrado";
      default:
        return category;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground" data-testid="text-recommendations-title">
                Recomendações Científicas
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie suas recomendações de manejo agrícola
              </p>
            </div>
          </div>

          {recommendations && recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Card key={rec.id} className={`border-l-4 ${getPriorityColor(rec.priority)}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg" data-testid={`recommendation-title-${rec.id}`}>
                          {rec.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" data-testid={`category-${rec.category}`}>
                            {getCategoryLabel(rec.category)}
                          </Badge>
                          <Badge 
                            className={getStatusColor(rec.status)}
                            data-testid={`status-${rec.status}`}
                          >
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(rec.status)}
                              <span>{rec.status}</span>
                            </span>
                          </Badge>
                          <Badge variant="outline" className={`${
                            rec.priority === "high" ? "text-red-600" :
                            rec.priority === "medium" ? "text-yellow-600" :
                            "text-green-600"
                          }`}>
                            {rec.priority} priority
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({
                            id: rec.id,
                            status: rec.status === "active" ? "completed" : "active"
                          })}
                          data-testid={`button-toggle-status-${rec.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(rec.id)}
                          data-testid={`button-delete-${rec.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground" data-testid={`recommendation-description-${rec.id}`}>
                      {rec.description}
                    </p>
                    <div className="mt-4 text-xs text-muted-foreground">
                      Criado em: {new Date(rec.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Nenhuma recomendação encontrada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Você ainda não possui recomendações. Vá para o dashboard e selecione um cultivo e protocolo para gerar recomendações.
                </p>
                <Button asChild>
                  <a href="/dashboard">Ir para Dashboard</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
