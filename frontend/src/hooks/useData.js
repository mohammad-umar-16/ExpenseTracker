import { useState, useEffect, useCallback } from 'react';
import { summaryMonthly, summaryInsights, expList, expCreate, expUpdate, expDelete } from '../api/api';
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