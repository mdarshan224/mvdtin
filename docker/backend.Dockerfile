FROM maven:3.9.11-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml ./pom.xml
RUN mvn -B -q dependency:go-offline
COPY backend/src ./src
RUN mvn -B -q -DskipTests package
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S dtm && adduser -S dtm -G dtm && mkdir uploads && chown dtm:dtm uploads
COPY --from=build /app/target/dtm-platform-1.0.0.jar /app/application.jar
USER dtm
EXPOSE 8080
ENTRYPOINT ["java","-XX:MaxRAMPercentage=75","-jar","/app/application.jar"]
