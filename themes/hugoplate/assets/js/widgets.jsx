import { h, render } from 'preact';
import { AssetClasses } from './components/asset-classes';
import { GoalExpense } from './components/goal-expense';

if (typeof window !== 'undefined') {
  window.preact = { h, render, createElement: h };
  window.AssetClasses = AssetClasses;
  window.GoalExpense = GoalExpense;
}
