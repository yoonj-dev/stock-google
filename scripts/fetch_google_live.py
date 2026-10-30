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

def extract_dynamic_earnings(stock, info):
    """
    Dynamically extracts official earnings reports, consensus, and calendar dates
    from official exchange/SEC feeds via yfinance (earnings_dates, calendar, financials).
    Eliminates rigid static quarter hardcoding.
    """
    now = datetime.now(ZoneInfo("America/New_York"))
    res = {
        "hasData": False,
        "quarter": "최신 공식 분기",
        "reportDate": None,
        "revenue": None,
        "revenueYoY": None,
        "revenueEstimate": None,
        "revenueBeat": None,
        "eps": None,
        "epsEstimate": None,
        "epsSurprisePercent": None,
        "epsBeat": None,
        "daysSinceReport": None,
        "isBreaking": False,
        "nextEarningsDate": None,
        "nextEpsEstimate": None,
        "revenueGrowthYoY": round(info.get("revenueGrowth", 0) * 100, 1) if info.get("revenueGrowth") else None,
        "earningsGrowthYoY": round(info.get("earningsGrowth", 0) * 100, 1) if info.get("earningsGrowth") else None,
        "operatingMargins": round(info.get("operatingMargins", 0) * 100, 1) if info.get("operatingMargins") else None,
        "totalRevenueTTM": round(info.get("totalRevenue", 0) / 1e9, 1) if info.get("totalRevenue") else None,
        "keyTakeaway": "",
    }

    # 1. Official Earnings Dates & Reported EPS vs Estimate
    try:
        ed = stock.earnings_dates
        if ed is not None and not ed.empty:
            reported = ed[ed["Reported EPS"].notna()]
            if not reported.empty:
                latest_ts = reported.index[0]
                latest_row = reported.iloc[0]
                rep_dt = latest_ts.to_pydatetime()
                
                # Dynamic Quarter naming (e.g., Oct report = Q3, Feb report = Q4, etc.)
                m = rep_dt.month
                y = rep_dt.year
                if m in [1, 2, 3]:
                    q_name = f"{y - 1} Q4"
                elif m in [4, 5, 6]:
                    q_name = f"{y} Q1"
                elif m in [7, 8, 9]:
                    q_name = f"{y} Q2"
                else:
                    q_name = f"{y} Q3"

                days_diff = (now.date() - rep_dt.date()).days
                rep_eps = round(float(latest_row["Reported EPS"]), 2)
                est_eps = round(float(latest_row["EPS Estimate"]), 2) if pd.notna(latest_row.get("EPS Estimate")) else None
                surprise = round(float(latest_row["Surprise(%)"]), 2) if pd.notna(latest_row.get("Surprise(%)")) else None

                res["hasData"] = True
                res["quarter"] = q_name
                res["reportDate"] = rep_dt.strftime("%Y-%m-%d")
                res["eps"] = rep_eps
                res["epsEstimate"] = est_eps
                res["epsSurprisePercent"] = surprise
                res["epsBeat"] = (surprise >= 0) if surprise is not None else (rep_eps >= est_eps if est_eps else True)
                res["daysSinceReport"] = max(0, days_diff)
                res["isBreaking"] = days_diff <= 14  # Breaking alert if within 14 days of release
            
            # Next upcoming earnings date
            upcoming = ed[ed["Reported EPS"].isna()]
            if not upcoming.empty:
                next_ts = upcoming.index[-1]
                next_dt = next_ts.to_pydatetime()
                res["nextEarningsDate"] = next_dt.strftime("%Y-%m-%d")
                res["nextEpsEstimate"] = round(float(upcoming.iloc[-1]["EPS Estimate"]), 2) if pd.notna(upcoming.iloc[-1].get("EPS Estimate")) else None
    except Exception as e:
        print(f"[{info.get('symbol', 'TICKER')}] earnings_dates extraction note: {e}")

    # 2. Calendar fallback for next earnings date
    if not res.get("nextEarningsDate"):
        try:
            cal = stock.calendar
            if cal and "Earnings Date" in cal and cal["Earnings Date"]:
                res["nextEarningsDate"] = str(cal["Earnings Date"][0])
            if cal and "Earnings Average" in cal and cal["Earnings Average"]:
                res["nextEpsEstimate"] = round(float(cal["Earnings Average"]), 2)
        except Exception:
            pass

    # 3. Dynamic Revenue from quarterly income stmt or info
    try:
        qi = stock.quarterly_income_stmt
        if qi is not None and not qi.empty and "Total Revenue" in qi.index:
            valid_cols = [c for c in qi.columns if pd.notna(qi.loc["Total Revenue", c])]
            if valid_cols:
                latest_col = valid_cols[0]
                q_rev = qi.loc["Total Revenue", latest_col]
                if q_rev and q_rev > 0:
                    res["revenue"] = round(float(q_rev) / 1e9, 1)
                
                # If 4 quarters ago exists, compute exact YoY
                if len(valid_cols) >= 5 and pd.notna(qi.loc["Total Revenue", valid_cols[4]]):
                    prev_rev = qi.loc["Total Revenue", valid_cols[4]]
                    if prev_rev and prev_rev > 0:
                        res["revenueYoY"] = round(((q_rev - prev_rev) / prev_rev) * 100, 1)
    except Exception:
        pass

    if res["revenue"] is None and res.get("totalRevenueTTM"):
        # Approximate recent quarter from TTM / 4
        res["revenue"] = round(res["totalRevenueTTM"] / 4, 1)
    if res["revenueYoY"] is None:
        res["revenueYoY"] = res.get("revenueGrowthYoY")

    # 4. Generate dynamic takeaway summary
    beat_str = "예상 상회(Beat)" if res.get("epsBeat") else "예상 하회(Miss)"
    rev_str = f"분기 매출 ${res.get('revenue', 0)}B(+{res.get('revenueYoY', 0)}%)" if res.get("revenue") else f"연간 매출 ${res.get('totalRevenueTTM', 0)}B"
    next_str = f"차기 실적 발표는 {res.get('nextEarningsDate')}로 예정되어 있습니다." if res.get("nextEarningsDate") else ""
    res["keyTakeaway"] = f"{res.get('quarter')} 공식 실적 기준 {rev_str}, 주당순이익(EPS) ${res.get('eps', 0)} ({beat_str})를 기록했습니다. 영업이익률 {res.get('operatingMargins', 0)}% 수준의 본업 수익성을 유지하고 있으며, {next_str}"

    return res

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
    fast = None
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

    # Standard Market State & Exact Price Extraction
    raw_state = str(info.get("marketState", "")).upper()
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

    # Regular session prices (Benchmark for day's trading: close vs previous close)
    reg_price = round(float(info.get("regularMarketPrice") or (getattr(fast, "last_price", 0) if fast else 0) or info.get("currentPrice", 0)), 2)
    prev_close = round(float(info.get("regularMarketPreviousClose") or (getattr(fast, "previous_close", 0) if fast else 0) or info.get("previousClose", reg_price)), 2)
    reg_change = round(float(info.get("regularMarketChange") or (reg_price - prev_close)), 2)
    reg_change_pct = round(float(info.get("regularMarketChangePercent") or (((reg_price - prev_close) / prev_close) * 100 if prev_close else 0)), 2)

    info["regularMarketPrice"] = reg_price
    info["regularMarketChange"] = reg_change
    info["regularMarketChangePercent"] = reg_change_pct
    info["regularMarketPreviousClose"] = prev_close
    info["regularLastPrice"] = reg_price
    info["previousClose"] = prev_close

    # Pre-market pricing (Base is ALWAYS reg_price from the regular session)
    pre_price = round(float(info["preMarketPrice"]), 2) if info.get("preMarketPrice") else None
    if pre_price:
        pre_change = round(float(info.get("preMarketChange") if info.get("preMarketChange") is not None else (pre_price - reg_price)), 2)
        pre_change_pct = round(float(info.get("preMarketChangePercent") if info.get("preMarketChangePercent") is not None else (((pre_price - reg_price) / reg_price) * 100 if reg_price else 0)), 2)
        info["preMarketPrice"] = pre_price
        info["preMarketChange"] = pre_change
        info["preMarketChangePercent"] = pre_change_pct

    # Post-market pricing (Base is ALWAYS reg_price from the regular session)
    post_price = round(float(info["postMarketPrice"]), 2) if info.get("postMarketPrice") else None
    if post_price:
        post_change = round(float(info.get("postMarketChange") if info.get("postMarketChange") is not None else (post_price - reg_price)), 2)
        post_change_pct = round(float(info.get("postMarketChangePercent") if info.get("postMarketChangePercent") is not None else (((post_price - reg_price) / reg_price) * 100 if reg_price else 0)), 2)
        info["postMarketPrice"] = post_price
        info["postMarketChange"] = post_change
        info["postMarketChangePercent"] = post_change_pct

    # Active Session Assignment: headline price reflects active session
    if market_state == "PRE" and pre_price:
        info["currentPrice"] = pre_price
        info["change"] = pre_change
        info["changePercent"] = pre_change_pct
        info["extendedLastPrice"] = pre_price
        info["extendedLastType"] = "PRE"
    elif market_state in ["POST", "OVERNIGHT"] and post_price:
        info["currentPrice"] = post_price
        info["change"] = post_change
        info["changePercent"] = post_change_pct
        info["extendedLastPrice"] = post_price
        info["extendedLastType"] = "POST"
    else:
        # REGULAR or CLOSED
        info["currentPrice"] = reg_price
        info["change"] = reg_change
        info["changePercent"] = reg_change_pct
        if post_price:
            info["extendedLastPrice"] = post_price
            info["extendedLastType"] = "POST"
        elif pre_price:
            info["extendedLastPrice"] = pre_price
            info["extendedLastType"] = "PRE"

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

    # Attach Dynamic Official Earnings Brief
    earnings_brief = extract_dynamic_earnings(stock, info)
    info["earningsFlash"] = earnings_brief
    info["earningsBrief"] = earnings_brief

    output_path = os.path.join(PUBLIC_DATA_DIR, f"{ticker}.json")
    result = {
        "metadata": {
            "symbol": ticker,
            "last_updated": datetime.now(ZoneInfo("America/New_York")).isoformat(),
        },
        "fundamentals": info,
        "earnings_flash": earnings_brief,
        "earnings_brief": earnings_brief,
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
