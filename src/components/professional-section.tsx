import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Upload, Star } from "lucide-react";

export default function ProfessionalSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [coordinates, setCoordinates] = useState({ latitude: "", longitude: "" });
  const [file, setFile] = useState<File | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.isPremium) {
        throw new Error("Assinatura premium necessária");
      }

      const data: any = {};
      
      if (coordinates.latitude && coordinates.longitude) {
        data.latitude = coordinates.latitude;
        data.longitude = coordinates.longitude;
      }
      
      if (file) {
        data.fileName = file.name;
        data.fileType = file.type;
        data.fileContent = "mock_file_content"; // In real app, would upload file
      }

      const response = await apiRequest("POST", "/api/professional/analyze", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Análise concluída",
        description: "Análise geoespacial realizada com sucesso.",
      });
      console.log("Analysis results:", data);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro na análise",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.toLowerCase().match(/\.(kml|kmz)$/)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Apenas arquivos KML e KMZ são aceitos.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleAnalyze = () => {
    if (!coordinates.latitude && !coordinates.longitude && !file) {
      toast({
        title: "Dados insuficientes",
        description: "Forneça coordenadas ou faça upload de um arquivo geoespacial.",
        variant: "destructive",
      });
      return;
    }
    analyzeMutation.mutate();
  };

  return (
    <Card className="bg-gradient-to-br from-accent/10 to-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-accent" />
            <span>Seção Profissional</span>
          </CardTitle>
          {!user?.isPremium && (
            <Badge variant="outline" className="bg-accent/20 text-accent">
              Premium
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {user?.isPremium ? (
          <>
            {/* Coordinates Input */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Coordenadas Geográficas
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Latitude"
                  value={coordinates.latitude}
                  onChange={(e) => setCoordinates({ ...coordinates, latitude: e.target.value })}
                  data-testid="input-latitude"
                />
                <Input
                  placeholder="Longitude"
                  value={coordinates.longitude}
                  onChange={(e) => setCoordinates({ ...coordinates, longitude: e.target.value })}
                  data-testid="input-longitude"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Upload de Arquivo Geoespacial
              </Label>
              <div className="border-2 border-dashed border-border rounded-md p-4 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".kml,.kmz"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {file ? file.name : "Arraste arquivos KML/KMZ ou clique para selecionar"}
                  </p>
                </label>
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending}
              className="w-full bg-accent hover:bg-accent/90"
              data-testid="button-advanced-analysis"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {analyzeMutation.isPending ? "Analisando..." : "Análise Avançada"}
            </Button>

            <div className="p-3 rounded-md bg-accent/20 border border-accent/30">
              <p className="text-xs text-accent-foreground/80">
                ✨ Recursos premium: Análise geoespacial, relatórios detalhados, dados históricos IBGE
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Non-premium view */}
            <div className="text-center py-6">
              <Star className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Recursos Profissionais
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Acesse análises geoespaciais avançadas, upload de arquivos KML/KMZ e relatórios detalhados.
              </p>
              <Button className="bg-accent hover:bg-accent/90" data-testid="button-upgrade-premium">
                <Star className="w-4 h-4 mr-2" />
                Upgrade para Premium
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
