// Curated universe of large/mid-cap US-listed stocks to scan.
// Kept to a bounded list (rather than the full market) so the screener
// can fetch fresh fundamentals for every symbol within a reasonable time
// and without hitting rate limits on the free Yahoo Finance endpoints.
export const STOCK_UNIVERSE: string[] = [
  // Technology
  "AAPL", "MSFT", "GOOGL", "GOOG", "AMZN", "NVDA", "META", "AVGO", "ORCL", "CRM",
  "ADBE", "AMD", "CSCO", "ACN", "INTC", "IBM", "QCOM", "TXN", "INTU", "NOW",
  "AMAT", "MU", "ADI", "LRCX", "KLAC", "SNPS", "CDNS", "PANW", "FTNT", "CRWD",
  "ANET", "PLTR", "APP", "DELL", "HPQ", "WDAY", "TEAM", "DDOG", "NET", "ZS",
  "SHOP", "UBER", "ABNB", "DASH", "SNOW", "MDB", "ADSK", "ROP", "MSI", "GLW",

  // Communication Services
  "NFLX", "DIS", "CMCSA", "T", "VZ", "TMUS", "CHTR", "EA", "TTWO", "WBD",
  "PINS", "SNAP", "SPOT", "MTCH",

  // Consumer Discretionary
  "TSLA", "HD", "MCD", "NKE", "LOW", "SBUX", "TJX", "BKNG", "CMG", "MAR",
  "GM", "F", "RIVN", "LULU", "ROST", "YUM", "ORLY", "AZO", "DHI", "LEN",

  // Consumer Staples
  "WMT", "PG", "KO", "PEP", "COST", "PM", "MO", "MDLZ", "CL", "KMB",
  "TGT", "DG", "KR", "STZ", "SYY",

  // Healthcare
  "LLY", "UNH", "JNJ", "MRK", "ABBV", "PFE", "TMO", "ABT", "DHR", "BMY",
  "AMGN", "ISRG", "MDT", "GILD", "VRTX", "CVS", "CI", "ELV", "REGN", "ZTS",
  "HCA", "BSX", "SYK", "BDX", "MRNA",

  // Financials
  "BRK-B", "JPM", "V", "MA", "BAC", "WFC", "GS", "MS", "AXP", "SPGI",
  "BLK", "C", "SCHW", "CB", "PGR", "MMC", "ICE", "PYPL", "USB", "PNC",
  "AON", "TRV", "AIG", "COF", "MET",

  // Industrials
  "CAT", "HON", "UNP", "RTX", "GE", "BA", "LMT", "DE", "UPS", "ADP",
  "ETN", "NOC", "GD", "CSX", "NSC", "ITW", "EMR", "PH", "TT", "WM",
  "FDX", "PCAR",

  // Energy
  "XOM", "CVX", "COP", "SLB", "EOG", "MPC", "PSX", "OXY", "WMB", "KMI",
  "VLO", "HES",

  // Materials
  "LIN", "SHW", "APD", "ECL", "FCX", "NEM", "DOW", "NUE",

  // Utilities
  "NEE", "DUK", "SO", "D", "AEP", "EXC", "SRE", "XEL",

  // Real Estate
  "PLD", "AMT", "EQIX", "PSA", "O", "SPG", "WELL", "DLR",
];
