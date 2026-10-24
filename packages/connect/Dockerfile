# openvireo connect as a single static-ish binary (Bun --compile) on distroless.
# Build from the repository root:  docker build -f packages/connect/Dockerfile -t openvireo-connect:0.1.0 .
FROM oven/bun:1.3.10 AS build
WORKDIR /src
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages ./packages
RUN bun install --ignore-scripts
# Bun resolves @openvireo/sdk through the workspace link, i.e. the SDK's dist/
RUN cd packages/sdk && bunx tsup && cd ../connect && bunx tsup
RUN bun build --compile --minify --sourcemap packages/connect/src/bin.ts --outfile /out/openvireo-connect

FROM gcr.io/distroless/cc-debian12:nonroot
COPY --from=build /out/openvireo-connect /usr/local/bin/openvireo-connect
ENV OPENVIREO_CONNECT_HOST=0.0.0.0 OPENVIREO_CONNECT_PORT=8080
EXPOSE 8080
USER 65532:65532
ENTRYPOINT ["/usr/local/bin/openvireo-connect"]
CMD ["serve"]
