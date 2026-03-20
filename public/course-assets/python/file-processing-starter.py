from pathlib import Path
import json


DATA_DIR = Path("data")
OUTPUT_DIR = Path("reports")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_json(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8") as source:
        return json.load(source)


def summarize_orders(rows: list[dict]) -> dict[str, float]:
    total_revenue = sum(float(row["amount"]) for row in rows)
    unique_customers = len({row["customer_id"] for row in rows})
    return {
        "rows": len(rows),
        "total_revenue": total_revenue,
        "unique_customers": unique_customers,
    }


if __name__ == "__main__":
    dataset = load_json(DATA_DIR / "customer-orders.json")
    summary = summarize_orders(dataset)
    print(summary)
