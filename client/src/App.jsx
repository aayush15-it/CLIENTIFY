const handleAnalyze = async (e) => {
  e.preventDefault();
  if (!company || !category) return;

  setLoading(true);
  setError('');

  try {
    const response = await fetch('https://clientify-fgz4.onrender.com/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, category }),
    });

    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      if (!response.ok) throw new Error(`Status ${response.status}: Analysis failed.`);
      throw new Error("Invalid data format received from server.");
    }

    const isFake = result.is_real === false || result.validation?.is_real === false;

    if (!response.ok && !isFake) {
      throw new Error(result.error || `Status ${response.status}: Analysis failed.`);
    }

    if (result && typeof result === 'object') {
      setData(result);
      setActiveTab('strategy');
    } else {
      throw new Error("Invalid data format received from server.");
    }

  } catch (err) {
    setError(err.message);
    setData(null);
  } finally {
    setLoading(false);
  }
};