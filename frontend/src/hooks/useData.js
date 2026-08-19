import { useState, useEffect, useCallback } from 'react';
import { summaryMonthly, summaryInsights, summaryBudgetProgress, expList, expCreate, expUpdate, expDelete, budgetList, budgetSet, budgetDelete } from '../api/api';
import toast from 'react-hot-toast';

export function useSummary(month, year) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    summaryMonthly(month, year)
      .then(setData)
      .catch(() => toast.error('Failed to load summary'))
      .finally(() => setLoading(false));
  }, [month, year]);

  useEffect(load, [load]);
  return { data, loading, refresh: load };
}

export function useInsights(month, year) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    setLoading(true);
    summaryInsights(month, year)
      .then(res => setInsights(Array.isArray(res?.insights) ? res.insights : []))
      .catch(() => setInsights([]))
      .finally(() => setLoading(false));
  }, [month, year]);

  return { insights, loading };
}

export function useDayExpenses(date) {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!date) return;
    setLoading(true);
    expList({ date })
      .then(res => setList(Array.isArray(res) ? res : []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(load, [load]);

  const add = async (d) => {
    try { await expCreate({ ...d, date }); toast.success('Added!'); load(); return true; }
    catch { toast.error('Failed to add'); return false; }
  };
  const update = async (id, d) => {
    try { await expUpdate(id, d); toast.success('Updated!'); load(); return true; }
    catch { toast.error('Failed to update'); return false; }
  };
  const remove = async (id) => {
    try { await expDelete(id); toast.success('Deleted'); load(); return true; }
    catch { toast.error('Failed to delete'); return false; }
  };

  return { list, loading, add, update, remove };
}

export function useBudgetProgress(month, year) {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading]   = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    summaryBudgetProgress(month, year)
      .then(res => setProgress(Array.isArray(res) ? res : []))
      .catch(() => setProgress([]))
      .finally(() => setLoading(false));
  }, [month, year]);

  useEffect(load, [load]);
  return { progress, loading, refresh: load };
}

export function useBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    budgetList()
      .then(res => setBudgets(Array.isArray(res) ? res : []))
      .catch(() => setBudgets([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const save = async (category, monthly_limit) => {
    try { await budgetSet(category, monthly_limit); load(); return true; }
    catch { toast.error('Failed to save budget'); return false; }
  };
  const remove = async (category) => {
    try { await budgetDelete(category); load(); return true; }
    catch { toast.error('Failed to remove budget'); return false; }
  };

  return { budgets, loading, save, remove, refresh: load };
}

export function useSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = async (filters) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await expList(filters);
      setResults(Array.isArray(res) ? res : []);
    } catch {
      toast.error('Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, hasSearched, search };
}
