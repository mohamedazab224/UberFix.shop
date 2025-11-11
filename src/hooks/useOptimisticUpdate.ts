import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface OptimisticUpdateOptions<TData, TVariables> {
  queryKey: string[];
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => void;
  updateCache?: (oldData: any, variables: TVariables) => any;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUpdate<TData, TVariables>({
  queryKey,
  mutationFn,
  onMutate,
  updateCache,
  successMessage,
  errorMessage,
}: OptimisticUpdateOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      
      const previousData = queryClient.getQueryData(queryKey);
      
      if (updateCache && previousData) {
        queryClient.setQueryData(queryKey, (old: any) => updateCache(old, variables));
      }
      
      onMutate?.(variables);
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      
      toast({
        title: "خطأ",
        description: errorMessage || "حدث خطأ أثناء العملية",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      if (successMessage) {
        toast({
          title: "نجح",
          description: successMessage,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
