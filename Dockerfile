# Synology Storage Tool — Docker image
# Use for DSM 7.2+ with Container Manager / Docker support
# Matches Python 3.9 available in the DSM Package Center

FROM python:3.9-slim

WORKDIR /app

# btrfs-progs + util-linux (nsenter): needed for accurate share sizes via btrfs qgroup
RUN apt-get update && apt-get install -y --no-install-recommends btrfs-progs util-linux \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app.py .
COPY static/ ./static/

# Data directory (mount a volume here for persistence)
RUN mkdir -p /app/data

EXPOSE 9000

ENV HOST=0.0.0.0
ENV PORT=9000
ENV DATA_DIR=/app/data

CMD ["python", "app.py"]
