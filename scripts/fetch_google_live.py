#!/usr/bin/env python3
"""
Alphabet (GOOGL & GOOG) Dedicated Real-time Data Fetcher
- Directly queries Yahoo Finance (yfinance)
- Computes RSI(14) and MFI(14)
- Formats OHLCV candles (1h, 1d, 1w)
- Extracts rich valuation fundamentals and Wall Street targets
- Generates public/data/GOOGL.json and public/data/GOOG.json
"""

import json
import os
import sys
import time
from datetime import datetime
from zoneinfo import ZoneInfo
import pandas as pd

try:
    import yfinance as yf
except ImportError:
    print("[WARN] yfinance not installed. Run: pip install yfinance pandas")
    sys.exit(0)

PUBLIC_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")
os.makedirs(PUBLIC_DATA_DIR, exist_ok=True)

TARGET_TICKERS = ["GOOGL", "GOOG"]

def calculate_indicators(df):
    """Computes Wilder's RSI and MFI matching TradingView standard."""
    if len(df) < 15:
        return df

    delta = df["Close"].diff()
    gain = delta.where(delta > 0, 0).ewm(alpha=1 / 14, adjust=False).mean()
    loss = -delta.where(delta < 0, 0).ewm(alpha=1 / 14, adjust=False).mean()
    rs = gain / loss.replace(0, float("nan"))
    df["rsi"] = 100 - (100 / (1 + rs))

    if "Volume" in df.columns and (df["Volume"] > 0).any():
        typical_price = (df["High"] + df["Low"] + df["Close"]) / 3
        money_flow = typical_price * df["Volume"]
        pos_flow = money_flow.where(typical_price > typical_price.shift(1), 0).rolling(14).sum()
        neg_flow = money_flow.where(typical_price < typical_price.shift(1), 0).rolling(14).sum()
        mfr = pos_flow / neg_flow.replace(0, float("nan"))
        df["mfi"] = 100 - (100 / (1 + mfr))
    else:
        df["mfi"] = None

    return df

def format_candles(df):
    if df.empty:
        return []
    df = df.dropna(subset=["Open", "High", "Low", "Close"])
    df = df[df["Open"] > 0].reset_index()
    time_col = df.columns[0]
    df["time"] = df[time_col].apply(lambda x: x.isoformat() if hasattr(x, "isoformat") else str(x))

    for col in ["Open", "High", "Low", "Close", "rsi", "mfi"]:
        if col in df.columns:
            df[col] = df[col].apply(lambda v: round(float(v), 2) if pd.notna(v) and v is not None else None)

    if "Volume" in df.columns:
        df["Volume"] = df["Volume"].fillna(0).astype("int64")

    cols = ["time", "Open", "High", "Low", "Close", "Volume", "rsi", "mfi"]
    records = df[[c for c in cols if c in df.columns]].to_dict(orient="records")
    return records

def collect_ticker(ticker: str):
    print(f"[{ticker}] Collecting fresh financial data...")
    stock = yf.Ticker(ticker)

    # 1. Fundamentals
    info = {}
    try:
        raw_info = stock.info
        allowed_types = (int, float, str, bool)
        for k, v in raw_info.items():
            if isinstance(v, allowed_types):
                if isinstance(v, float):
                    if pd.isna(v) or v in [float("inf"), float("-inf")]:
                        continue
                    v = round(v, 2)
                info[k] = v
    except Exception as e:
        print(f"[{ticker}] Info fetch warning: {e}")

    # Fallback to fast_info
    try:
        fast = stock.fast_info
        if "currentPrice" not in info or not info["currentPrice"]:
            info["currentPrice"] = round(float(getattr(fast, "last_price", 0)), 2)
        if "previousClose" not in info or not info["previousClose"]:
            info["previousClose"] = round(float(getattr(fast, "previous_close", 0)), 2)
        if "marketCap" not in info or not info["marketCap"]:
            info["marketCap"] = int(getattr(fast, "market_cap", 0))
    except Exception:
        pass

    # Ensure price change
    curr = info.get("currentPrice", 0)
    prev = info.get("previousClose", curr)
    if curr and prev:
        info["change"] = round(curr - prev, 2)
        info["changePercent"] = round(((curr - prev) / prev) * 100, 2)

    # 2. Candles
    candles = {}
    try:
        df_1d = stock.history(period="1y", interval="1d")
        if df_1d is not None and not df_1d.empty:
            df_1d = calculate_indicators(df_1d)
            candles["1d"] = format_candles(df_1d)
    except Exception as e:
        print(f"[{ticker}] 1d history warning: {e}")

    try:
        df_1h = stock.history(period="1mo", interval="1h", prepost=True)
        if df_1h is not None and not df_1h.empty:
            df_1h = calculate_indicators(df_1h)
            candles["1h"] = format_candles(df_1h)
    except Exception as e:
        print(f"[{ticker}] 1h history warning: {e}")

    output_path = os.path.join(PUBLIC_DATA_DIR, f"{ticker}.json")
    result = {
        "metadata": {
            "symbol": ticker,
            "last_updated": datetime.now(ZoneInfo("America/New_York")).isoformat(),
        },
        "fundamentals": info,
        "candles": candles,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"[{ticker}] Saved successfully to {output_path}")

def main():
    print("=== Alphabet (GOOGL & GOOG) Live Fetcher ===")
    for ticker in TARGET_TICKERS:
        try:
            collect_ticker(ticker)
        except Exception as e:
            print(f"Error fetching {ticker}: {e}")

if __name__ == "__main__":
    main()
