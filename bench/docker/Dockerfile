# MesenCE 2.2.1, headless, for scripted experiments. See ../MESEN.md.
#
# The release zip is fetched by Docker with --checksum, so a tampered or
# swapped download fails the build. Digests are GitHub's, cross-checked
# against Mesen's own update manifest (nesdev-org/MesenAutoUpdate).
#
#   docker build -t mesence-bench:2.2.1 bench/docker

FROM debian:bookworm-slim AS fetch
ARG TARGETARCH
RUN apt-get update && apt-get install -y --no-install-recommends unzip && rm -rf /var/lib/apt/lists/*
ADD --checksum=sha256:5030702ba13d043bf926ee3cc6c6a5d3567e08345e9c50b2df4d4d08b90ead30 \
    https://github.com/nesdev-org/MesenCE/releases/download/2.2.1/Mesen_2.2.1_Linux_ARM64.zip /tmp/mesen-arm64.zip
ADD --checksum=sha256:c88ff4d251b407515c43d3332d641927655cd69fb538996b6a21da4509dbb58f \
    https://github.com/nesdev-org/MesenCE/releases/download/2.2.1/Mesen_2.2.1_Linux_x64.zip /tmp/mesen-amd64.zip
RUN mkdir /opt/mesen && unzip -q /tmp/mesen-${TARGETARCH}.zip -d /opt/mesen && chmod 0555 /opt/mesen/Mesen

FROM debian:bookworm-slim
# 2.2.1 links SDL2 directly (master loads it lazily, audio only); no audio device is opened headless.
RUN apt-get update && apt-get install -y --no-install-recommends \
      libstdc++6 libfontconfig1 libicu72 ca-certificates libsdl2-2.0-0 \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --uid 1000 --create-home --home-dir /home/mesen mesen
COPY --from=fetch /opt/mesen /opt/mesen
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
USER mesen
ENV HOME=/home/mesen
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
