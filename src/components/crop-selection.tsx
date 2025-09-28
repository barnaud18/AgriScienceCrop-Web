import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BarChart3 } from "lucide-react";

interface Crop {
  id: string;
  name: string;
  emoji: string;
  category: string;
}

interface Protocol {
  id: string;
  name: string;
  description: string;
  type: string;
}

export default function CropSelection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [selectedProtocol, setSelectedProtocol] = useState<string>("");

  const { data: crops, isLoading: cropsLoading } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
  });

  const { data: protocols, isLoading: protocolsLoading } = useQuery<Protocol[]>({
    queryKey: ["/api/protocols"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/recommendations/generate", {
        cropId: selectedCrop,
        protocolId: selectedProtocol,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Recomendações geradas",
        description: "Novas recomendações foram criadas com base no cultivo e protocolo selecionados.",
      });
      setSelectedCrop("");
      setSelectedProtocol("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao gerar recomendações",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!selectedCrop || !selectedProtocol) {
      toast({
        title: "Seleção incompleta",
        description: "Selecione um cultivo e um protocolo antes de continuar.",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate();
  };

  if (cropsLoading || protocolsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seleção de Cultivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Seleção de Cultivo</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Crop Selection */}
        <div>
          <label className="text-sm font-medium text-card-foreground mb-3 block">
            Cultivo Principal (30 cultivos brasileiros)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {crops?.map((crop) => (
              <button
                key={crop.id}
                onClick={() => setSelectedCrop(crop.id)}
                className={`p-3 rounded-md border-2 transition-colors ${
                  selectedCrop === crop.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary hover:bg-primary/5"
                }`}
                data-testid={`crop-${crop.name.toLowerCase()}`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center text-xs">
                    {crop.emoji}
                  </div>
                  <span className="text-sm font-medium">{crop.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Protocol Selection */}
        <div>
          <label className="text-sm font-medium text-card-foreground mb-3 block">
            Protocolo de Manejo
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {protocols?.map((protocol) => (
              <button
                key={protocol.id}
                onClick={() => setSelectedProtocol(protocol.id)}
                className={`p-4 rounded-md border text-left transition-colors ${
                  selectedProtocol === protocol.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary hover:bg-primary/5"
                }`}
                data-testid={`protocol-${protocol.type}`}
              >
                <div className="text-sm font-medium text-card-foreground">
                  {protocol.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {protocol.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected items display */}
        {(selectedCrop || selectedProtocol) && (
          <div className="flex flex-wrap gap-2">
            {selectedCrop && (
              <Badge variant="secondary" data-testid="badge-selected-crop">
                Cultivo: {crops?.find(c => c.id === selectedCrop)?.name}
              </Badge>
            )}
            {selectedProtocol && (
              <Badge variant="secondary" data-testid="badge-selected-protocol">
                Protocolo: {protocols?.find(p => p.id === selectedProtocol)?.name}
              </Badge>
            )}
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={!selectedCrop || !selectedProtocol || generateMutation.isPending}
          className="w-full"
          data-testid="button-generate-recommendations"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          {generateMutation.isPending ? "Gerando..." : "Gerar Recomendações"}
        </Button>
      </CardContent>
    </Card>
  );
}
