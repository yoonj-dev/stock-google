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
import warnings
from datetime import datetime
from zoneinfo import ZoneInfo
import pandas as pd

warnings.filterwarnings("ignore")

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

def tag_session(dt):
    """Tags candle as PRE, REGULAR, or POST based on Eastern Time."""
    h = dt.hour
    m = dt.minute
    if h < 9 or (h == 9 and m < 30):
        return "PRE"
    elif (h == 9 and m >= 30) or (10 <= h < 16):
        return "REGULAR"
    else:
        return "POST"

def format_candles(df, add_session=False):
    if df.empty:
        return []
    df = df.dropna(subset=["Open", "High", "Low", "Close"])
    df = df[df["Open"] > 0].reset_index()
    time_col = df.columns[0]
    df["time"] = df[time_col].apply(lambda x: x.isoformat() if hasattr(x, "isoformat") else str(x))

    if add_session:
        df["session"] = df[time_col].apply(lambda x: tag_session(x) if hasattr(x, "hour") else "REGULAR")

    for col in ["Open", "High", "Low", "Close", "rsi", "mfi"]:
        if col in df.columns:
            df[col] = df[col].apply(lambda v: round(float(v), 2) if pd.notna(v) and v is not None else None)

    if "Volume" in df.columns:
        df["Volume"] = df["Volume"].fillna(0).astype("int64")

    cols = ["time", "Open", "High", "Low", "Close", "Volume", "rsi", "mfi"]
    if add_session:
        cols.append("session")
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
        if "regularMarketPrice" not in info or not info["regularMarketPrice"]:
            info["regularMarketPrice"] = round(float(getattr(fast, "last_price", 0)), 2)
        if "previousClose" not in info or not info["previousClose"]:
            info["previousClose"] = round(float(getattr(fast, "previous_close", 0)), 2)
        if "marketCap" not in info or not info["marketCap"]:
            info["marketCap"] = int(getattr(fast, "market_cap", 0))
    except Exception:
        pass

    # Determine market state and extended hours pricing
    raw_state = str(info.get("marketState", "")).upper()
    reg_price = info.get("regularMarketPrice") or info.get("currentPrice", 0)
    prev_close = info.get("regularMarketPreviousClose") or info.get("previousClose", reg_price)
    post_price = info.get("postMarketPrice")
    pre_price = info.get("preMarketPrice")

    # Normalize market state
    if "REGULAR" in raw_state:
        market_state = "REGULAR"
    elif "POST" in raw_state:
        market_state = "POST"
    elif "PRE" in raw_state:
        market_state = "PRE"
    elif "OVERNIGHT" in raw_state:
        market_state = "OVERNIGHT"
    elif "CLOSED" in raw_state:
        market_state = "CLOSED"
    else:
        # Determine based on current NY time
        ny_now = datetime.now(ZoneInfo("America/New_York"))
        hour = ny_now.hour
        minute = ny_now.minute
        weekday = ny_now.weekday()
        if weekday >= 5:
            market_state = "CLOSED"
        elif hour < 4:
            market_state = "OVERNIGHT"
        elif hour < 9 or (hour == 9 and minute < 30):
            market_state = "PRE"
        elif (hour == 9 and minute >= 30) or (10 <= hour < 16):
            market_state = "REGULAR"
        elif 16 <= hour < 20:
            market_state = "POST"
        else:
            market_state = "OVERNIGHT"

    info["marketState"] = market_state

    # Select effective headline price (currentPrice)
    if market_state in ["POST", "OVERNIGHT"] and post_price:
        current_price = post_price
        extended_last_price = post_price
        extended_last_type = "POST"
    elif market_state == "PRE" and pre_price:
        current_price = pre_price
        extended_last_price = pre_price
        extended_last_type = "PRE"
    elif post_price and not pre_price and market_state == "CLOSED":
        # Keep latest postMarket trade on closed days
        current_price = post_price
        extended_last_price = post_price
        extended_last_type = "POST"
    else:
        current_price = reg_price
        extended_last_price = post_price or pre_price or None
        extended_last_type = "POST" if post_price else ("PRE" if pre_price else None)

    info["currentPrice"] = round(float(current_price), 2)
    info["regularLastPrice"] = round(float(reg_price), 2)
    info["previousClose"] = round(float(prev_close), 2)
    if extended_last_price:
        info["extendedLastPrice"] = round(float(extended_last_price), 2)
        info["extendedLastType"] = extended_last_type

    # Ensure total change from previous close
    if current_price and prev_close:
        info["change"] = round(current_price - prev_close, 2)
        info["changePercent"] = round(((current_price - prev_close) / prev_close) * 100, 2)

    # 2. Candles
    candles = {}

    # 2-A. 1D Intraday 5m Candles with Pre/Post extended hours
    try:
        df_5m = stock.history(period="1d", interval="5m", prepost=True)
        if df_5m is None or len(df_5m) < 10:
            df_2d = stock.history(period="2d", interval="5m", prepost=True)
            if df_2d is not None and not df_2d.empty:
                # Filter to latest trading date
                latest_date = df_2d.index[-1].date()
                df_5m = df_2d[df_2d.index.date == latest_date]

        if df_5m is not None and not df_5m.empty:
            candles["1d_intraday"] = format_candles(df_5m, add_session=True)
            print(f"[{ticker}] Collected {len(candles['1d_intraday'])} 1D intraday candles")
    except Exception as e:
        print(f"[{ticker}] 1d intraday history warning: {e}")

    # 2-B. 1H Candles (1 Month with Pre/Post)
    try:
        df_1h = stock.history(period="1mo", interval="1h", prepost=True)
        if df_1h is not None and not df_1h.empty:
            df_1h = calculate_indicators(df_1h)
            candles["1h"] = format_candles(df_1h, add_session=True)
    except Exception as e:
        print(f"[{ticker}] 1h history warning: {e}")

    # 2-C. 1D Daily Candles (1 Year)
    try:
        df_1d = stock.history(period="1y", interval="1d")
        if df_1d is not None and not df_1d.empty:
            df_1d = calculate_indicators(df_1d)
            candles["1d"] = format_candles(df_1d)
    except Exception as e:
        print(f"[{ticker}] 1d history warning: {e}")

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

    print(f"[{ticker}] Saved successfully to {output_path} (Price: ${info['currentPrice']}, Change: {info['changePercent']}%, State: {info['marketState']})")

def main():
    print("=== Alphabet (GOOGL & GOOG) Live Fetcher ===")
    for ticker in TARGET_TICKERS:
        try:
            collect_ticker(ticker)
        except Exception as e:
            print(f"Error fetching {ticker}: {e}")

if __name__ == "__main__":
    main()
