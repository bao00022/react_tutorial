interface Suggestions {
  suggestions: [{ value: string }];
}

export async function fetchSuggestions(keyword: string): Promise<string[]> {
  try {
    const key = "1bed1ffde465fddba2a53ad3ce69e6c2"; // public key for testing
    const url = `https://api.addsearch.com/v1/suggest/${key}?term=${encodeURIComponent(keyword)}`;
    const response = await fetch(url);
    const data: Suggestions = await response.json();
    console.log("Fetched suggestions:", data);
    const arr: string[] = (data.suggestions || []).map((item) => item.value);
    return arr;
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
}
