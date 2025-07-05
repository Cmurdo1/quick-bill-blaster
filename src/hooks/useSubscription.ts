
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscription({ subscribed: false, subscription_tier: 'free', subscription_end: null });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSubscription(data || { subscribed: false, subscription_tier: 'free', subscription_end: null });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = () => {
    return subscription?.subscribed || false;
  };

  const getTier = () => {
    return subscription?.subscription_tier || 'free';
  };

  const hasFeature = (feature: string) => {
    const tier = getTier();
    
    const features = {
      free: ['basic_invoices'],
      pro: ['basic_invoices', 'unlimited_invoices', 'custom_templates', 'client_portal'],
      business: ['basic_invoices', 'unlimited_invoices', 'custom_templates', 'client_portal', 'multi_user', 'api_access']
    };

    return features[tier as keyof typeof features]?.includes(feature) || false;
  };

  return {
    subscription,
    loading,
    isSubscribed,
    getTier,
    hasFeature,
    refetch: fetchSubscription
  };
};
