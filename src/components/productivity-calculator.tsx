import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ibgeService } from "@/services/ibge-api";
import { Calculator, TrendingUp, DollarSign } from "lucide-react";

interface Crop {
  id: string;
  name: string;
  emoji: string;
}

export default function ProductivityCalculator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    municipality: "",
    state: "",
    area: "",
    cropId: "",
  });
  const [results, setResults] = useState<any>(null);

  const { data: crops } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
  });

  const calculateMutation = useMutation({
    mutationFn: async () => {
      if (!formData.municipality || !formData.state || !formData.area || !formData.cropId) {
        throw new Error("Todos os campos são obrigatórios");
      }

      return ibgeService.calculateProductivity({
        municipality: formData.municipality,
        state: formData.state,
        area: parseFloat(formData.area),
        cropId: formData.cropId,
      });
    },
    onSuccess: (data) => {
      setResults(data.data);
      toast({
        title: "Cálculo realizado",
        description: "Produtividade calculada com dados do IBGE.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no cálculo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCalculate = () => {
    calculateMutation.mutate();
  };

  const brazilianStates = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Calculadora de Produtividade</span>
          </CardTitle>
          <Badge variant="outline" className="bg-accent text-accent-foreground">
            IBGE API
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="municipality">Município</Label>
            <Input
              id="municipality"
              placeholder="Ex: Rondonópolis"
              value={formData.municipality}
              onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
              data-testid="input-municipality"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
              <SelectTrigger data-testid="select-state">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {brazilianStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crop">Cultivo</Label>
            <Select value={formData.cropId} onValueChange={(value) => setFormData({ ...formData, cropId: value })}>
              <SelectTrigger data-testid="select-crop">
                <SelectValue placeholder="Selecione o cultivo" />
              </SelectTrigger>
              <SelectContent>
                {crops?.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    {crop.emoji} {crop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Área (hectares)</Label>
            <Input
              id="area"
              type="number"
              placeholder="Ex: 100"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              data-testid="input-area"
            />
          </div>
        </div>

        {/* Results Display */}
        {results && (
          <div className="p-4 rounded-md bg-muted/50 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-primary mr-2" />
                </div>
                <div className="text-2xl font-bold text-card-foreground" data-testid="result-yield">
                  {results.yield?.toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-muted-foreground">kg/ha (IBGE 2023)</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calculator className="h-5 w-5 text-primary mr-2" />
                </div>
                <div className="text-2xl font-bold text-primary" data-testid="result-production">
                  {results.totalProduction?.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                </div>
                <div className="text-sm text-muted-foreground">toneladas estimadas</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-5 w-5 text-accent mr-2" />
                </div>
                <div className="text-2xl font-bold text-accent" data-testid="result-value">
                  R$ {results.marketValue?.toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-muted-foreground">valor estimado</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Badge variant="outline" className="text-xs">
                Fonte: {results.source}
              </Badge>
            </div>
          </div>
        )}

        <Button
          onClick={handleCalculate}
          disabled={calculateMutation.isPending}
          className="w-full"
          data-testid="button-calculate"
        >
          <Calculator className="w-4 h-4 mr-2" />
          {calculateMutation.isPending ? "Calculando..." : "Calcular Produtividade"}
        </Button>
      </CardContent>
    </Card>
  );
}
