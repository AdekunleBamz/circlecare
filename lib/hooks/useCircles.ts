import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStacks } from '../StacksProvider';
import { getNetwork } from '../stacks';
import { 
  getUserCircles, 
  getCircleInfo, 
  createCircle,
  CreateCircleParams 
} from '../contracts';
import { openContractCall } from '@stacks/connect';

export function useUserCircles() {
  const { userAddress, network } = useStacks();
  
  return useQuery({
    queryKey: ['circles', userAddress],
    queryFn: async () => {
      if (!userAddress) return [];
      const stacksNetwork = getNetwork(network);
      return getUserCircles(userAddress, stacksNetwork);
    },
    enabled: !!userAddress,
  });
}

export function useCircleInfo(circleId: number | null) {
  const { network } = useStacks();
  
  return useQuery({
    queryKey: ['circle', circleId],
    queryFn: async () => {
      if (!circleId) return null;
      const stacksNetwork = getNetwork(network);
      return getCircleInfo(circleId, stacksNetwork);
    },
    enabled: !!circleId,
  });
}

export function useCreateCircle() {
  const { network, userAddress } = useStacks();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: Omit<CreateCircleParams, 'network' | 'senderAddress'>) => {
      if (!userAddress) throw new Error('Wallet not connected');
      
      const stacksNetwork = getNetwork(network);
      const txOptions = await createCircle({
        ...params,
        network: stacksNetwork,
        senderAddress: userAddress,
      });

      return openContractCall(txOptions);
    },
    onSuccess: () => {
      // Invalidate circles cache to refetch
      queryClient.invalidateQueries({ queryKey: ['circles'] });
    },
  });
}