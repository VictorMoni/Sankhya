FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# resolve dependências em cache
RUN mvn -q -e -DskipTests dependency:go-offline
# copia o código e empacota
COPY src ./src
RUN mvn -q -DskipTests clean package

# ===== run =====
FROM eclipse-temurin:21-jre
WORKDIR /app
# copie o fat jar gerado pelo repackage
COPY --from=build /app/target/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
