FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# cache de deps
COPY pom.xml .
RUN mvn -q -ntp -DskipTests dependency:go-offline

# código + build
COPY src ./src
RUN mvn -q -ntp -DskipTests package

# ===== Runtime =====
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
