"""
Basic metrics endpoint for Prometheus
"""

from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from prometheus_client import Counter, Histogram, generate_latest

# Basic metrics similar to Go catalog service
request_count = Counter(
    "users_http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status_code"]
)

request_duration = Histogram(
    "users_http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"]
)

router = APIRouter(tags=["metrics"])


@router.get("/metrics", response_class=PlainTextResponse)
async def get_metrics():
    """
    Prometheus metrics endpoint - basic implementation
    Similar to Go catalog service but simplified for now
    """
    return generate_latest()