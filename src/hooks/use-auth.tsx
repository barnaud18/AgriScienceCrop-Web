import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "farmer" | "agronomist";
  isPremium: boolean;
}

interface AuthResponse {
  token: string;
  user: User;
}

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
    enabled: !!localStorage.getItem("token"),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao AgriScience BR!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      lastName: string;
      username: string;
      role: "farmer" | "agronomist";
    }) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      queryClient.setQueryData(["/api/auth/me"], data.user);
      toast({
        title: "Conta criada",
        description: "Bem-vindo ao AgriScience BR!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.clear();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
}
