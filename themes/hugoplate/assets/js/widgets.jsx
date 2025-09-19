import { h, render } from 'preact';
import { AssetClasses } from './components/asset-classes';
import { GoalExpense } from './components/goal-expense';
import { Goal } from './components/goal';
import { Stocks} from './components/stocks';

if (typeof window !== 'undefined') {
  window.preact = { h, render, createElement: h };
  window.AssetClasses = AssetClasses;
  window.GoalExpense = GoalExpense;
  window.Goal = Goal;
  window.Stocks = Stocks;
}
