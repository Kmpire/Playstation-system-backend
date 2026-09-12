import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { CLIENT_ORIGIN, NODE_ENV } from "./config/env.js";
import apiRouter from "./routes/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { swaggerSpec } from "./docs/swagger.js";
import { renderSwaggerUiPage } from "./docs/swaggerUiPage.js";

const app = express();
const isDevelopment = NODE_ENV === "development";
const DOCS_PATH = "/api/v1/docs";
const DOCS_SPEC_PATH = `${DOCS_PATH}/swagger.json`;

app.set("trust proxy", true);

// Middlewares
app.use(
  cors({
    origin: CLIENT_ORIGIN === "*" ? true : CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Redirect root to swagger docs
app.get("/", (_req, res) => {
  return res.redirect(`${DOCS_PATH}/`);
});

// Serve OpenAPI JSON spec with dynamic host/protocol detection
app.get(DOCS_SPEC_PATH, (req, res) => {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0].trim()
      : req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  const origin = `${protocol}://${host}`;

  return res.status(200).json({
    ...swaggerSpec,
    servers: [
      {
        url: origin,
        description: "Current server",
      },
    ],
  });
});

// Swagger UI configuration
if (isDevelopment) {
  app.use(
    DOCS_PATH,
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: DOCS_SPEC_PATH,
        validatorUrl: null,
      },
      explorer: true,
    }),
  );
} else {
  const serveDocsHtml = (_req: express.Request, res: express.Response) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(renderSwaggerUiPage(DOCS_SPEC_PATH));
  };

  app.get(DOCS_PATH, serveDocsHtml);
  app.get(`${DOCS_PATH}/`, serveDocsHtml);
}

// Routes
app.use("/api/v1", apiRouter);

// Error handling middleware (must be after routes)
app.use(errorMiddleware);

export default app;
