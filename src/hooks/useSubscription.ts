
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Subscription {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, session } = useAuth();

  useEffect(() => {
    if (user && session) {
      fetchSubscription();
    } else {
      setSubscription({ subscribed: false, subscription_tier: 'free', subscription_end: null });
      setLoading(false);
    }
  }, [user, session]);

  const fetchSubscription = async () => {
    if (!user || !session?.access_token) {
      setSubscription({ subscribed: false, subscription_tier: 'free', subscription_end: null });
      setLoading(false);
      return;
    }

    try {
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

  const checkSubscriptionStatus = async () => {
    if (!session?.access_token) return;

    try {
      await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      // Refetch subscription data after checking
      await fetchSubscription();
    } catch (error) {
      console.error('Error checking subscription status:', error);
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
    refetch: fetchSubscription,
    checkSubscriptionStatus
  };
};
