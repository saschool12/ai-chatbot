# Multi-stage build for Java AI Chatbot
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /workspace

# Copy build files first for layer caching
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle .
RUN ./gradlew dependencies --no-daemon || true

# Build application jar
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# Production Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Run as unprivileged user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /workspace/build/libs/*.jar app.jar

EXPOSE 8080

ENV SERVER_PORT=8080
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
