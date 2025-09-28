import { apiRequest } from "@/lib/queryClient";

export interface ProductivityCalculation {
  yield: number;
  totalProduction: number;
  marketValue: number;
  source: string;
}

export interface CalculationRequest {
  municipality: string;
  state: string;
  area: number;
  cropId: string;
  year?: number;
}

export const ibgeService = {
  async calculateProductivity(data: CalculationRequest): Promise<{
    calculation: any;
    data: ProductivityCalculation;
  }> {
    const response = await apiRequest("POST", "/api/productivity/calculate", data);
    return response.json();
  },

  async getCalculations() {
    const response = await apiRequest("GET", "/api/productivity/calculations");
    return response.json();
  },
};
