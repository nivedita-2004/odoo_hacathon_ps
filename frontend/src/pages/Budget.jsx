import { useState } from 'react';
import { useQuery } from 'react-query';
import { budgetAPI } from '../services/api';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  DollarSign,
  AlertCircle,
  Loader2
} from 'lucide-react';

const BudgetCategory = ({ title, amount, total, color }) => {
  const percentage = total > 0 ? (amount / total) * 100 : 0;
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <span className="text-sm text-gray-900">${amount.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default function Budget() {
  const [selectedTrip, setSelectedTrip] = useState('');

  const { data: budgetData, isLoading } = useQuery(
    ['budget', selectedTrip],
    () => budgetAPI.getBudget(selectedTrip).then(res => res.data.data),
    { enabled: !!selectedTrip }
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Budget Tracker</h1>
        <p className="page-subtitle">Track and manage your travel expenses</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Budgeted</p>
              <p className="text-2xl font-bold text-gray-900">$12,500</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">$8,350</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-2xl font-bold text-green-600">$4,150</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Budget Breakdown</h2>
          </div>
          <div className="p-6">
            <BudgetCategory
              title="Transportation"
              amount={3500}
              total={12500}
              color="bg-blue-500"
            />
            <BudgetCategory
              title="Accommodation"
              amount={4200}
              total={12500}
              color="bg-purple-500"
            />
            <BudgetCategory
              title="Food & Dining"
              amount={2800}
              total={12500}
              color="bg-orange-500"
            />
            <BudgetCategory
              title="Activities"
              amount={2000}
              total={12500}
              color="bg-green-500"
            />
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Budget Alerts</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Food budget at 75%</p>
                <p className="text-sm text-yellow-600">You've spent $2,100 of $2,800 allocated</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Under budget on activities!</p>
                <p className="text-sm text-green-600">You've saved $500 on planned activities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
