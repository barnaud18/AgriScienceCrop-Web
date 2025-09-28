import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Activity, Thermometer, Droplets, Zap, AlertTriangle, CheckCircle, Plus, MapPin } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { CropField, Alert as AlertType, MonitoringData, Crop } from '@shared/schema';

const SENSOR_ICONS = {
  soil_moisture: Droplets,
  soil_temperature: Thermometer,
  air_temperature: Thermometer,
  humidity: Droplets,
  ph: Zap,
  nutrients: Activity,
  weather: Activity
};

const SENSOR_UNITS = {
  soil_moisture: '%',
  soil_temperature: '°C',
  air_temperature: '°C',
  humidity: '%',
  ph: 'pH',
  nutrients: 'ppm',
  weather: ''
};

export default function MonitoringPage() {
  const [selectedField, setSelectedField] = useState<string>('');
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lastMessage, isConnected } = useWebSocket();

  // Fetch data
  const { data: fields = [] } = useQuery<CropField[]>({
    queryKey: ['/api/monitoring/fields'],
  });

  const { data: alerts = [] } = useQuery<AlertType[]>({
    queryKey: ['/api/monitoring/alerts'],
  });

  const { data: crops = [] } = useQuery<Crop[]>({
    queryKey: ['/api/crops'],
  });

  const { data: monitoringData = [] } = useQuery<MonitoringData[]>({
    queryKey: ['/api/monitoring/data', selectedField],
    enabled: !!selectedField,
  });

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'monitoring_data') {
        queryClient.invalidateQueries({ queryKey: ['/api/monitoring/data'] });
      } else if (lastMessage.type === 'new_alert') {
        queryClient.invalidateQueries({ queryKey: ['/api/monitoring/alerts'] });
        toast({
          title: 'Nova alerta!',
          description: lastMessage.alert?.title || 'Nova alerta de monitoramento',
          variant: 'destructive',
        });
      }
    }
  }, [lastMessage, queryClient, toast]);

  // Mutations
  const markAlertAsRead = useMutation({
    mutationFn: (alertId: string) => apiRequest(`/api/monitoring/alerts/${alertId}/read`, 'PUT'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/monitoring/alerts'] });
    },
  });

  const resolveAlert = useMutation({
    mutationFn: (alertId: string) => apiRequest(`/api/monitoring/alerts/${alertId}/resolve`, 'PUT'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/monitoring/alerts'] });
      toast({
        title: 'Alerta resolvida',
        description: 'A alerta foi marcada como resolvida',
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return severity;
    }
  };

  const getAlertTypeText = (type: string) => {
    const types = {
      weather: 'Clima',
      pest: 'Praga',
      disease: 'Doença',
      soil: 'Solo',
      irrigation: 'Irrigação',
      harvest: 'Colheita'
    };
    return types[type as keyof typeof types] || type;
  };

  const groupedMonitoringData = monitoringData.reduce((acc, data) => {
    if (!acc[data.sensorType]) {
      acc[data.sensorType] = [];
    }
    acc[data.sensorType].push(data);
    return acc;
  }, {} as Record<string, MonitoringData[]>);

  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && !alert.isResolved);

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="monitoring-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Monitoramento</h1>
          <p className="text-gray-600">Acompanhe suas culturas em tempo real</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-field">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Campo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Campo</DialogTitle>
                <DialogDescription>
                  Cadastre um novo campo para monitoramento
                </DialogDescription>
              </DialogHeader>
              <AddFieldForm onSuccess={() => setShowFieldDialog(false)} crops={crops} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50" data-testid="critical-alerts-banner">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalAlerts.length} alertas críticas</strong> requerem atenção imediata!
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campos Ativos</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stats-active-fields">{fields.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Não Lidas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="stats-unread-alerts">
              {unreadAlerts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="stats-critical-alerts">
              {criticalAlerts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sensores Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="stats-active-sensors">
              {Object.keys(groupedMonitoringData).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="fields" data-testid="tab-fields">Campos</TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">Alertas</TabsTrigger>
          <TabsTrigger value="data" data-testid="tab-data">Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Monitoring Data */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Recentes</CardTitle>
                <CardDescription>Últimas leituras dos sensores</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedField ? (
                  <div className="space-y-4">
                    {Object.entries(groupedMonitoringData).map(([sensorType, data]) => {
                      const Icon = SENSOR_ICONS[sensorType as keyof typeof SENSOR_ICONS];
                      const unit = SENSOR_UNITS[sensorType as keyof typeof SENSOR_UNITS];
                      const latest = data[0];
                      
                      return (
                        <div key={sensorType} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium capitalize">{sensorType.replace('_', ' ')}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(latest.timestamp!).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {parseFloat(latest.value).toFixed(1)}{unit}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">Selecione um campo para ver os dados</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas Recentes</CardTitle>
                <CardDescription>Últimas notificações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {getSeverityText(alert.severity)}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-gray-600 truncate">{alert.message}</p>
                        <p className="text-xs text-gray-500">
                          {getAlertTypeText(alert.type)} • {new Date(alert.createdAt!).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      {!alert.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAlertAsRead.mutate(alert.id)}
                          data-testid={`button-mark-read-${alert.id}`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => {
              const crop = crops.find(c => c.id === field.cropId);
              return (
                <Card key={field.id} className={`cursor-pointer transition-all ${selectedField === field.id ? 'ring-2 ring-green-500' : ''}`}
                      onClick={() => setSelectedField(field.id)}
                      data-testid={`field-card-${field.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{field.name}</CardTitle>
                      <Badge variant={field.status === 'active' ? 'default' : 'secondary'}>
                        {field.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <CardDescription>
                      {crop?.name} • {parseFloat(field.area).toFixed(1)} ha
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Estágio:</strong> {field.growthStage}</p>
                      {field.plantingDate && (
                        <p className="text-sm">
                          <strong>Plantio:</strong> {new Date(field.plantingDate).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      {field.latitude && field.longitude && (
                        <p className="text-sm">
                          <strong>Localização:</strong> {parseFloat(field.latitude).toFixed(4)}, {parseFloat(field.longitude).toFixed(4)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card key={alert.id} className={!alert.isRead ? 'border-orange-200 bg-orange-50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {getSeverityText(alert.severity)}
                        </Badge>
                        <Badge variant="outline">{getAlertTypeText(alert.type)}</Badge>
                        {alert.isResolved && <Badge variant="secondary">Resolvida</Badge>}
                      </div>
                      <CardTitle>{alert.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      {!alert.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAlertAsRead.mutate(alert.id)}
                          data-testid={`button-mark-read-${alert.id}`}
                        >
                          Marcar como Lida
                        </Button>
                      )}
                      {!alert.isResolved && (
                        <Button
                          size="sm"
                          onClick={() => resolveAlert.mutate(alert.id)}
                          data-testid={`button-resolve-${alert.id}`}
                        >
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">{alert.message}</p>
                  {alert.actionRequired && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Ação Requerida:</p>
                      <p className="text-sm text-blue-800">{alert.actionRequired}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    {new Date(alert.createdAt!).toLocaleString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados de Monitoramento</CardTitle>
              <CardDescription>
                {selectedField ? `Campo selecionado: ${fields.find(f => f.id === selectedField)?.name}` : 'Selecione um campo para ver os dados'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedField && monitoringData.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedMonitoringData).map(([sensorType, data]) => {
                    const Icon = SENSOR_ICONS[sensorType as keyof typeof SENSOR_ICONS];
                    const unit = SENSOR_UNITS[sensorType as keyof typeof SENSOR_UNITS];
                    
                    return (
                      <div key={sensorType} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-medium capitalize">{sensorType.replace('_', ' ')}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {data.slice(0, 8).map((reading) => (
                            <div key={reading.id} className="p-3 border rounded-lg">
                              <p className="text-2xl font-bold text-blue-600">
                                {parseFloat(reading.value).toFixed(1)}{unit}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(reading.timestamp!).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {selectedField ? 'Nenhum dado de monitoramento disponível' : 'Selecione um campo para ver os dados'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component for adding new fields
function AddFieldForm({ onSuccess, crops }: { onSuccess: () => void; crops: Crop[] }) {
  const [formData, setFormData] = useState({
    name: '',
    cropId: '',
    area: '',
    latitude: '',
    longitude: '',
    plantingDate: '',
    expectedHarvestDate: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createField = useMutation({
    mutationFn: (data: any) => apiRequest('/api/monitoring/fields', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/monitoring/fields'] });
      toast({
        title: 'Campo criado',
        description: 'Novo campo adicionado com sucesso',
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar campo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createField.mutate({
      ...formData,
      area: parseFloat(formData.area),
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      plantingDate: formData.plantingDate ? new Date(formData.plantingDate) : undefined,
      expectedHarvestDate: formData.expectedHarvestDate ? new Date(formData.expectedHarvestDate) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Campo</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          data-testid="input-field-name"
        />
      </div>

      <div>
        <Label htmlFor="cropId">Cultura</Label>
        <Select value={formData.cropId} onValueChange={(value) => setFormData({ ...formData, cropId: value })}>
          <SelectTrigger data-testid="select-crop">
            <SelectValue placeholder="Selecione uma cultura" />
          </SelectTrigger>
          <SelectContent>
            {crops.map((crop) => (
              <SelectItem key={crop.id} value={crop.id}>
                {crop.emoji} {crop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="area">Área (hectares)</Label>
        <Input
          id="area"
          type="number"
          step="0.01"
          value={formData.area}
          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
          required
          data-testid="input-area"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude (opcional)</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            data-testid="input-latitude"
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude (opcional)</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            data-testid="input-longitude"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="plantingDate">Data de Plantio (opcional)</Label>
          <Input
            id="plantingDate"
            type="date"
            value={formData.plantingDate}
            onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
            data-testid="input-planting-date"
          />
        </div>
        <div>
          <Label htmlFor="expectedHarvestDate">Previsão de Colheita (opcional)</Label>
          <Input
            id="expectedHarvestDate"
            type="date"
            value={formData.expectedHarvestDate}
            onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
            data-testid="input-harvest-date"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={createField.isPending} data-testid="button-create-field">
        {createField.isPending ? 'Criando...' : 'Criar Campo'}
      </Button>
    </form>
  );
}