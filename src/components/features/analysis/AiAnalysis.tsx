import React, { useState } from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { generateAiInsights } from '../../../services/geminiService';
import { formatCurrency } from '../../../lib/utils';
import type { Expense, Budget } from '../../../types';

interface AiAnalysisProps {
  expenses: Expense[];
  budgets: Budget[];
}

export const AiAnalysis: React.FC<AiAnalysisProps> = ({ expenses, budgets }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = React.useMemo(() => {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryBreakdown = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const overspentBudgets = budgets.map(b => {
      const spent = categoryBreakdown[b.category] || 0;
      return {
        category: b.category,
        limit: b.limit,
        spent,
        over: spent > b.limit ? spent - b.limit : 0,
      };
    }).filter(b => b.over > 0);

    return {
      totalSpent,
      categoryBreakdown,
      overspentBudgets,
    };
  }, [expenses, budgets]);

  const handleScan = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    const promptText = `
Given the following user expense data and budget limits, analyze their spending behavior, identify any overspends, and provide 3 high-impact, actionable budget hacks.

CURRENT DATA:
Total Spending: INR ${stats.totalSpent}
Category Breakdown: ${JSON.stringify(stats.categoryBreakdown)}
Configured Budgets: ${JSON.stringify(budgets.map(b => ({ category: b.category, limit: b.limit })))}
Overspent Categories: ${JSON.stringify(stats.overspentBudgets)}

Please structure your response with:
1. **SPENDING CHALLENGES**: A friendly but clear statement about where they are spending the most (be direct and motivating).
2. **RECOMMENDED BUDGET ADVICE**: Specific limits they should adjust based on their actual spending.
3. **3 HIGH-IMPACT BUDGET TIPS**: Helpful, sensible advice (e.g., shopping tips, subscription checks, food prep). Keep headings bold and uppercase.
`;

    const systemInstruction = "You are a helpful, direct, and constructive personal finance advisor. You give highly actionable, plain-language financial insights. No generic corporate sugarcoating. Keep it concise, high-impact, and structured under custom uppercase headers.";

    try {
      const result = await generateAiInsights(promptText, systemInstruction);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI budget insights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-brutal bg-white p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none z-10">
        <div className="absolute top-4 -right-6 bg-yellow-400 border-y-2 border-black font-black uppercase text-[9px] tracking-widest py-1 w-28 rotate-45 text-center select-none">
          AI ASSIST
        </div>
      </div>

      <div className="border-b-2 border-black pb-3 mb-5 flex items-center gap-3">
        <Sparkles size={24} className="text-yellow-500 fill-yellow-400" />
        <h2 className="font-black text-lg uppercase tracking-tight text-black">
          AI Budget Analysis
        </h2>
      </div>

      {stats.overspentBudgets.length > 0 && (
        <div className="p-4 bg-red-100 border-2 border-black mb-6 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertTriangle size={18} strokeWidth={3} />
            <span className="font-black text-xs uppercase tracking-wider">Alert: Overspending Detected</span>
          </div>
          <div className="space-y-1">
            {stats.overspentBudgets.map((b, i) => (
              <p key={i} className="text-xs font-bold text-black uppercase">
                {b.category} budget exceeded by <span className="text-red-600 font-extrabold">{formatCurrency(b.over)}</span> (Spent {formatCurrency(b.spent)} of {formatCurrency(b.limit)})
              </p>
            ))}
          </div>
        </div>
      )}

      {analysis ? (
        <div className="space-y-4 font-mono text-xs uppercase leading-relaxed text-black bg-neutral-50 border-2 border-black p-5 relative min-h-[140px] whitespace-pre-wrap">
          <div className="absolute top-3 right-3 text-[9px] font-black tracking-widest text-emerald-600">
            [REPORT GENERATED]
          </div>
          {analysis}
          <div className="pt-3 border-t-2 border-black flex justify-end">
            <button 
              onClick={handleScan}
              className="px-3 py-1 border-2 border-black bg-yellow-300 font-black text-[9px] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer uppercase tracking-tight"
            >
              GENERATE NEW INSIGHTS
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-yellow-50 border-2 border-black border-dashed flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-center space-y-1">
            <p className="font-black uppercase tracking-tight text-black text-sm">
              Run AI Budget Insights
            </p>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide max-w-sm">
              Our AI will analyze your spending habits across all categories, identify overspent items, and suggest actionable ways to save more money.
            </p>
          </div>

          <button
            onClick={handleScan}
            disabled={loading}
            className="btn-brutal text-xs"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-3 w-3 border-2 border-black border-t-transparent rounded-full" />
                ANALYZING DATA...
              </span>
            ) : (
              'GET SPENDING INSIGHTS'
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 border-2 border-black font-extrabold text-xs uppercase text-red-600">
          ANALYSIS FAILURE: {error}
        </div>
      )}
    </div>
  );
};

export default AiAnalysis;
