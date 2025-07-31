// import express from "express";
// import cors from 'cors';
// import 'dotenv/config';
// import cookieParser from "cookie-parser";
// import connectDB from "./config/mongodb.js";
// import authRouter from "./routes/authRoutes.js";
// import userRouter from "./routes/userRoutes.js";

// const app = express();
// const port = process.env.PORT || 4000
// connectDB();


// const allowedOrigins = [process.env.CHART_FRONTEND_URL, process.env.AUTHENTICATION_FRONTEND_URL].filter(Boolean);
// console.log("Allowed Origins:", allowedOrigins);

// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({origin: allowedOrigins,credentials: true}))

// //API Endpoints

// app.get('/', (req, res) => {
//   res.send("API working");
// });

// app.use('/api/auth', authRouter);
// app.use('/api/user', userRouter);

// app.listen(port, () => console.log(`Server started on PORT:${port}`));

// import express from "express";
// import cors from 'cors';
// import 'dotenv/config';
// import cookieParser from "cookie-parser";
// import connectDB from "./config/mongodb.js";
// import authRouter from "./routes/authRoutes.js";
// import userRouter from "./routes/userRoutes.js";

// const app = express();
// const port = process.env.PORT || 4000;

// connectDB();

// // const allowedOrigins = [
// //   process.env.CHART_FRONTEND_URL,
// //   process.env.AUTHENTICATION_FRONTEND_URL
// // ].filter(Boolean);

// // ✅ HARD-CODED ALLOWED ORIGINS TO AVOID ENV FAILURES ON RENDER
// const allowedOrigins = [
//   "https://allied-engineers-authfrontend-new.onrender.com",
//   "https://allied-engineers-chartsfrontend.onrender.com"
// ];

// console.log("Allowed Origins:", allowedOrigins); // DEBUGGING

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.log("Blocked origin:", origin); // DEBUGGING
//       callback(new Error('CORS error: Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));

// // For preflight requests (OPTIONS)
// app.options('*', cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('CORS error: Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));

// app.use(express.json());
// app.use(cookieParser());

// // Routes
// app.get('/', (req, res) => {
//   res.send("API working");
// });
// app.use('/api/auth', authRouter);
// app.use('/api/user', userRouter);

// app.listen(port, () => console.log(`Server started on PORT:${port}`));

// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import cookieParser from "cookie-parser";
// import connectDB from "./config/mongodb.js";
// import authRouter from "./routes/authRoutes.js";
// import userRouter from "./routes/userRoutes.js";

// const app = express();
// const port = process.env.PORT || 4000;

// connectDB();

// // ✅ Hardcoded frontend origins (RECOMMENDED for Render)
// const allowedOrigins = [
//   "https://allied-engineers-authfrontend-new.onrender.com",
//   "https://allied-engineers-chartsfrontend.onrender.com"
// ];

// console.log("Allowed Origins:", allowedOrigins); // Debugging

// // ✅ CORRECT: Apply CORS with credentials
// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true
// }));

// app.use(express.json());
// app.use(cookieParser());

// // ✅ API routes
// app.get('/', (req, res) => {
//   res.send("API working");
// });
// app.use('/api/auth', authRouter);
// app.use('/api/user', userRouter);

// app.listen(port, () => console.log(`✅ Server started on PORT: ${port}`));


import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

connectDB();

const allowedOrigins = [
  "https://allied-engineers-authfrontend-new.onrender.com/api/",
  "https://allied-engineers-chartsfrontend.onrender.com/api/"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send("API working");
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(port, () => console.log(`Server started on PORT: ${port}`));


