# kpx connect as a single static-ish binary (Bun --compile) on distroless.
# Build from the repository root:  docker build -f packages/connect/Dockerfile -t kpx-connect:0.1.0 .
FROM oven/bun:1.3.10 AS build
WORKDIR /src
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
RUN bun install --production --ignore-scripts
# tsconfig paths resolve @kpnx/sdk to its sources, so no separate SDK build is needed
RUN bun build --compile --minify --sourcemap packages/connect/src/bin.ts --outfile /out/kpx-connect

FROM gcr.io/distroless/cc-debian12:nonroot
COPY --from=build /out/kpx-connect /usr/local/bin/kpx-connect
ENV KPX_CONNECT_HOST=0.0.0.0 KPX_CONNECT_PORT=8080
EXPOSE 8080
USER 65532:65532
ENTRYPOINT ["/usr/local/bin/kpx-connect"]
CMD ["serve"]
