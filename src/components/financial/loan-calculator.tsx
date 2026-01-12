import { useState, useEffect } from "react";
import { Car } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, BarChart3, Download } from "lucide-react";

interface LoanCalculatorProps {
  car?: Car;
  defaultPrice?: number;
}

export default function LoanCalculator({ car, defaultPrice = 25000 }: LoanCalculatorProps) {
  const initialPrice = car?.price ? Number(car.price) : defaultPrice;
  const [loanAmount, setLoanAmount] = useState<number>(initialPrice);
  const [downPayment, setDownPayment] = useState<number>(Math.round(initialPrice * 0.2)); // 20% down payment (common in India)
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5% interest rate (typical for Indian auto loans)
  const [loanTerm, setLoanTerm] = useState<number>(60); // 60 months (5 years)
  
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  
  // Recalculate when inputs change
  useEffect(() => {
    // Calculate loan amount after down payment
    const principal = loanAmount - downPayment;
    
    if (principal <= 0 || interestRate <= 0 || loanTerm <= 0) {
      setMonthlyPayment(0);
      setTotalInterest(0);
      setTotalCost(0);
      return;
    }
    
    // Convert annual interest rate to monthly and decimal
    const monthlyRate = interestRate / 100 / 12;
    
    // Calculate monthly payment using the loan formula
    // M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const payment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
      (Math.pow(1 + monthlyRate, loanTerm) - 1);
    
    const totalPaid = payment * loanTerm;
    const interestPaid = totalPaid - principal;
    
    setMonthlyPayment(payment);
    setTotalInterest(interestPaid);
    setTotalCost(totalPaid + downPayment);
  }, [loanAmount, downPayment, interestRate, loanTerm]);
  
  // Handle loan amount change
  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setLoanAmount(value);
      // Adjust down payment to maintain the same percentage
      const downPaymentPercentage = downPayment / loanAmount;
      setDownPayment(Math.round(value * downPaymentPercentage));
    }
  };
  
  // Handle down payment change
  const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= loanAmount) {
      setDownPayment(value);
    }
  };
  
  // Handle down payment percentage change via slider
  const handleDownPaymentPercentChange = (value: number[]) => {
    const percentage = value[0];
    setDownPayment(Math.round(loanAmount * (percentage / 100)));
  };
  
  // Handle interest rate change
  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setInterestRate(value);
    }
  };
  
  // Handle loan term change
  const handleLoanTermChange = (value: number[]) => {
    setLoanTerm(value[0]);
  };
  
  // Calculate the LTV (Loan to Value) ratio
  const ltvRatio = ((loanAmount - downPayment) / loanAmount) * 100;
  
  // Determine LTV status
  const getLtvStatus = () => {
    if (ltvRatio <= 80) return { text: "Excellent", color: "text-success" };
    if (ltvRatio <= 90) return { text: "Good", color: "text-primary" };
    if (ltvRatio <= 95) return { text: "Fair", color: "text-warning" };
    return { text: "High Risk", color: "text-error" };
  };
  
  const ltvStatus = getLtvStatus();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Auto Loan Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Loan Details Inputs */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="loan-amount">Car Price (₹)</Label>
              <Input
                id="loan-amount"
                type="number"
                value={loanAmount}
                onChange={handleLoanAmountChange}
                min={0}
              />
            </div>
            
            <div>
              <div className="flex justify-between">
                <Label htmlFor="down-payment">Down Payment (₹{downPayment.toLocaleString()})</Label>
                <span className="text-sm text-primary">{Math.round((downPayment / loanAmount) * 100)}%</span>
              </div>
              <div className="pt-2 px-1">
                <Slider
                  id="down-payment-percent"
                  min={0}
                  max={50}
                  step={1}
                  value={[Math.round((downPayment / loanAmount) * 100)]}
                  onValueChange={handleDownPaymentPercentChange}
                  className="my-2"
                />
              </div>
              <Input
                id="down-payment"
                type="number"
                value={downPayment}
                onChange={handleDownPaymentChange}
                min={0}
                max={loanAmount}
              />
            </div>
            
            <div>
              <Label htmlFor="interest-rate">Interest Rate (%)</Label>
              <Input
                id="interest-rate"
                type="number"
                value={interestRate}
                onChange={handleInterestRateChange}
                min={0}
                step={0.1}
              />
            </div>
            
            <div>
              <div className="flex justify-between">
                <Label htmlFor="loan-term">Loan Term ({loanTerm} months)</Label>
                <span className="text-sm text-primary">{Math.floor(loanTerm / 12)} years</span>
              </div>
              <div className="pt-2 px-1">
                <Slider
                  id="loan-term"
                  min={12}
                  max={84}
                  step={12}
                  value={[loanTerm]}
                  onValueChange={handleLoanTermChange}
                  className="my-2"
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Loan Summary Results */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-sm text-neutral-medium">Monthly Payment</div>
              <div className="text-3xl font-bold text-primary mt-1">
                ₹{monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center pt-2">
              <div>
                <div className="text-sm text-neutral-medium">Total Interest</div>
                <div className="text-lg font-medium text-warning mt-1">
                  ₹{totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-medium">Total Cost</div>
                <div className="text-lg font-medium mt-1">
                  ₹{totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-neutral-medium">Loan-to-Value</div>
                <div className={`text-lg font-medium ${ltvStatus.color} mt-1`}>
                  {ltvRatio.toFixed(0)}% ({ltvStatus.text})
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-medium">Principal Amount</div>
                <div className="text-lg font-medium mt-1">
                  ₹{(loanAmount - downPayment).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Amortization
            </Button>
            <Button className="flex-1" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Save Calculation
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}