FROM maven:3.9.9-eclipse-temurin-23-alpine AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:23-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]