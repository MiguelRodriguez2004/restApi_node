import express from "express";
import morgan from "morgan";

//Routes
import vetRoutes from "./routes/vet.routes";

const app=express();

//Setting
app.set("port", 4000);

//Middlewares
app.use(morgan("dev"));
app.use(express.json());

//Routes
app.use("/api/vet", vetRoutes);

export default app;