
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PricingSectionProps {
  onNavigate?: (page: string) => void;
  onShowAuth?: () => void;
}

const plans = [
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "Perfect for small businesses",
    features: [
      "Unlimited invoices",
      "Custom templates",
      "Priority support",
      "Advanced reporting",
      "Client portal",
      "Payment tracking"
    ],
    cta: "Subscribe Now",
    popular: true,
    priceId: "price_1234567890abcdef" // Replace with your actual Stripe price ID
  },
  {
    name: "Business",
    price: "$19",
    period: "/month",
    description: "For growing companies",
    features: [
      "Everything in Pro",
      "Multi-user accounts",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "White-label options"
    ],
    cta: "Subscribe Now",
    popular: false,
    priceId: "price_0987654321fedcba" // Replace with your actual Stripe price ID
  }
];

const PricingSection = ({ onNavigate, onShowAuth }: PricingSectionProps) => {
  const { toast } = useToast();
  const { user, session } = useAuth();

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!user || !session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive"
      });
      if (onShowAuth) {
        onShowAuth();
      }
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.priceId,
          successUrl: `${window.location.origin}/subscription-success`,
          cancelUrl: `${window.location.origin}/#pricing`
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your business needs. Start managing your invoices professionally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-green-500 border-2 scale-105 shadow-lg' : 'border-gray-200 shadow-md'}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 hover:bg-green-600">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full ${plan.popular ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {!user && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Ready to get started? Create your account today.
            </p>
            <Button 
              onClick={onShowAuth}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Sign Up Now
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingSection;
