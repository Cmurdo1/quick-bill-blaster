
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PricingSectionProps {
  onNavigate: (page: string) => void;
}

const PricingSection = ({ onNavigate }: PricingSectionProps) => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "Up to 5 invoices per month",
        "Basic invoice templates",
        "Client management",
        "PDF downloads"
      ],
      buttonText: "Get Started Free",
      isPopular: false
    },
    {
      name: "Pro",
      price: "$9",
      period: "/month",
      description: "Best for growing businesses",
      features: [
        "Unlimited invoices",
        "Premium templates",
        "Email automation",
        "Payment tracking",
        "Advanced reporting",
        "Priority support"
      ],
      buttonText: "Start Pro Trial",
      isPopular: true
    },
    {
      name: "Business",
      price: "$19",
      period: "/month",
      description: "For established businesses",
      features: [
        "Everything in Pro",
        "Multi-user access",
        "API access",
        "Custom branding",
        "Advanced integrations",
        "Dedicated support"
      ],
      buttonText: "Upgrade Now!",
      isPopular: false
    }
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that's right for your business. All plans include a 14-day free trial.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-lg p-8 shadow-lg relative ${
                plan.isPopular ? 'border-2 border-green-600 transform scale-105' : 'border border-gray-200'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => onNavigate('create-invoice')}
                className={`w-full py-3 ${
                  plan.isPopular 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
