import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import dns from "dns";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 3000;

console.log(`NODE_ENV is set to: ${process.env.NODE_ENV}`);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Reject too-large payloads with helpful error
app.use((err:any, req:any, res:any, next:any) => {
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      error: 'Payload too large',
      message: 'Request body exceeds the 10MB limit. Reduce file size or upload smaller json/files.'
    });
  }
  next(err);
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  const maskedUri = MONGODB_URI.replace(/:([^:@]{1,})@/, ':****@');
  res.json({ 
    status: "ok", 
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    mongodbError: lastMongoError,
    mongodbUri: maskedUri,
    dnsDiagnostic: dnsDiagnostic,
    dbStatus: mongoose.connection.readyState,
    emailService: (process.env.EMAIL_USER && process.env.EMAIL_PASS) ? "configured" : "missing",
    env: process.env.NODE_ENV,
    time: new Date().toISOString(),
  });
});

// Test route to verify API connectivity
app.get("/api/test", (req, res) => {
  res.json({ message: "API is reachable", method: req.method });
});

let lastMongoError: string | null = null;
let dnsDiagnostic: string | null = null;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

// Fix for incorrect hostname in Secrets
if (MONGODB_URI === "yadu01" || MONGODB_URI.includes("yadu01")) {
  console.warn("WARNING: Incorrect MONGODB_URI detected in Secrets. Using default URI instead.");
}

// Run DNS Diagnostics
if (MONGODB_URI.startsWith('mongodb+srv')) {
  try {
    const urlParts = MONGODB_URI.split('@')[1]?.split('/')[0]?.split('?')[0];
    if (urlParts) {
      console.log(`Running DNS diagnostics for: ${urlParts}`);
      
      // 1. Test SRV Record (Required for mongodb+srv)
      dns.resolveSrv(`_mongodb._tcp.${urlParts}`, (err, addresses) => {
        if (err) {
          dnsDiagnostic = `DNS SRV Resolution failed: ${err.message}. `;
          console.error(`SRV Resolution failed: ${err.message}`);
          
          // 2. Test A Record (Basic hostname check)
          dns.resolve4(urlParts, (err4, addresses4) => {
            if (err4) {
              dnsDiagnostic += `Basic hostname resolution also failed: ${err4.message}. This usually means the hostname is wrong or your network is blocking it.`;
              console.error(`A Record Resolution failed: ${err4.message}`);
            } else {
              dnsDiagnostic += `However, basic hostname resolution worked (${addresses4[0]}). This confirms the issue is specifically with SRV records. You MUST use the "Standard Connection String" (mongodb://) from Atlas.`;
              console.log(`A Record Resolution successful: ${addresses4[0]}`);
            }
          });
        } else {
          dnsDiagnostic = "DNS SRV Resolution successful. Your network can see the MongoDB cluster.";
          console.log("SRV Resolution successful:", addresses);
        }
      });
    }
  } catch (e) {
    console.error("Failed to run DNS diagnostics:", e);
  }
}

if (!process.env.MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI environment variable is NOT set. Using default local URI.");
  console.warn("NOTE: 'localhost' will NOT work if your database is running on your local machine, as this app is running in a cloud container.");
} else {
  console.log("MONGODB_URI environment variable is set.");
  if (process.env.MONGODB_URI.includes('localhost') || process.env.MONGODB_URI.includes('127.0.0.1')) {
    console.warn("WARNING: Your MONGODB_URI uses 'localhost'. This will NOT work in the cloud environment unless you have a MongoDB instance running INSIDE the container.");
    console.warn("SUGGESTION: Use a free MongoDB Atlas cluster (https://www.mongodb.com/cloud/atlas) for a cloud-hosted database.");
  }
}

// Mask password for logging
const maskedUri = MONGODB_URI.replace(/:([^:@]{1,})@/, ':****@');
console.log(`Attempting to connect to MongoDB: ${maskedUri}`);

// Connection options for better stability
const mongoOptions = {
  serverSelectionTimeoutMS: 10000, // Increased timeout to 10s
  socketTimeoutMS: 45000,
  family: 4, // Force IPv4 to avoid some DNS resolution issues in certain environments
};

mongoose.connect(MONGODB_URI, mongoOptions)
  .then(() => {
    console.log("Successfully connected to MongoDB");
    lastMongoError = null;
  })
  .catch((err) => {
    lastMongoError = err.message;
    console.error("MongoDB connection error details:");
    console.error(`- Message: ${err.message}`);
    
    if (err.message.includes('ENOTFOUND')) {
      console.error("- Error: DNS resolution failed. Check your hostname in MONGODB_URI.");
      if (MONGODB_URI.startsWith('mongodb+srv')) {
        console.error("- Suggestion: The 'mongodb+srv' protocol requires a valid DNS SRV record. If you are connecting to a local or non-Atlas instance, try using 'mongodb://' instead of 'mongodb+srv://'.");
        console.error("- Also, ensure your cluster name (e.g., cluster0.sddcdsn.mongodb.net) is exactly correct.");
      }
    } else if (err.message.includes('ETIMEOUT')) {
      console.error("- Error: Connection timed out. Check your IP Whitelist in MongoDB Atlas.");
    } else if (err.message.includes('Authentication failed')) {
      console.error("- Error: Authentication failed. Check your username and password in MONGODB_URI.");
    }
    
    console.error("- Check your MONGODB_URI in the App Settings (Gear icon > Secrets).");
  });

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'hospital', 'ambulance', 'admin', 'owner'], default: 'patient' },
  profileImage: String,
  isEmailVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  // Hospital specific fields
  address: String,
  location: {
    lat: Number,
    lng: Number
  },
  totalBeds: Number,
  availableBeds: Number,
  phone: String,
  specialization: [String],
  isApproved: { type: Boolean, default: true }, // Default true for patients/doctors, false for hospital/ambulance
  createdAt: { type: Date, default: Date.now }
});

const bookingSchema = new mongoose.Schema({
  userId: String,
  hospitalId: String,
  hospitalName: String,
  patientName: String,
  aadharNumber: String,
  mobileNumber: String,
  email: String,
  patientType: { type: String, enum: ['IPD', 'OPD', 'Critical', 'Emergency'], default: 'OPD' },
  address: String,
  conditionDescription: String,
  reportName: String,
  reportData: String,
  bedType: String,
  status: { type: String, default: 'Pending' }, // Pending, Admitted, Discharged, Rejected
  billingAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'Unpaid' },
  createdAt: { type: Date, default: Date.now }
});

const ambulanceBookingSchema = new mongoose.Schema({
  userId: String,
  patientName: String,
  fatherName: String,
  aadharNumber: String,
  mobileNumber: String,
  email: String,
  destination: String,
  pickupLocation: {
    lat: Number,
    lng: Number
  },
  status: { type: String, default: 'Pending' },
  otp: String,
  otpVerified: { type: Boolean, default: false },
  driverId: String,
  driverLocation: {
    lat: Number,
    lng: Number
  },
  createdAt: { type: Date, default: Date.now }
});

const doctorSchema = new mongoose.Schema({
  hospitalId: String,
  name: String,
  specialization: String,
  schedule: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  salary: Number,
  commissionRate: Number, // Percentage per patient/surgery
  attendance: [{
    date: Date,
    status: String
  }],
  createdAt: { type: Date, default: Date.now }
});

const inventorySchema = new mongoose.Schema({
  hospitalId: String,
  itemName: String,
  category: { type: String, enum: ['Medicine', 'Surgical', 'Equipment', 'Other'] },
  stock: Number,
  minStockAlert: Number,
  expiryDate: Date,
  supplierName: String,
  unitPrice: Number,
  createdAt: { type: Date, default: Date.now }
});

const expenseSchema = new mongoose.Schema({
  hospitalId: String,
  title: String,
  category: { type: String, enum: ['Utility', 'Maintenance', 'Salary', 'Supplies', 'Other'] },
  amount: Number,
  date: { type: Date, default: Date.now },
  description: String
});

const feedbackSchema = new mongoose.Schema({
  hospitalId: String,
  patientName: String,
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Booking = mongoose.model("Booking", bookingSchema);
const AmbulanceBooking = mongoose.model("AmbulanceBooking", ambulanceBookingSchema);
const Doctor = mongoose.model("Doctor", doctorSchema);
const Inventory = mongoose.model("Inventory", inventorySchema);
const Expense = mongoose.model("Expense", expenseSchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);

// Nodemailer Transporter
import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

let transporter = createTransporter();

// Verify transporter connection at startup
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log(`Email service initialized for: ${process.env.EMAIL_USER.substring(0, 3)}...${process.env.EMAIL_USER.split('@')[1]}`);
  transporter.verify((error, success) => {
    if (error) {
      console.error("Nodemailer verification failed (Startup):", error.message);
      if (error.message.includes('535-5.7.8')) {
        console.error("CRITICAL: Gmail authentication failed. You MUST use an 'App Password', not your regular password.");
        console.error("Follow these steps: Google Account > Security > 2-Step Verification > App Passwords.");
      }
    } else {
      console.log("Nodemailer is ready to send emails");
    }
  });
} else {
  console.warn("WARNING: EMAIL_USER or EMAIL_PASS environment variables are NOT set. OTP functionality will NOT work.");
}

// Pre-defined Owner Credentials
const OWNER_EMAIL = "owner@healthhaven.com";
const OWNER_PASSWORD = "owner_password_123";

// API Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!email.endsWith("@gmail.com")) {
      return res.status(400).json({ message: "Only Gmail addresses are allowed." });
    }

    // Block manual owner registration
    if (role === 'owner') {
      return res.status(403).json({ message: "Owner registration is restricted." });
    }

    // Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: "Database connection is not ready. Please check MONGODB_URI in settings.",
        dbStatus: mongoose.connection.readyState 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Set approval status based on role
    const isApproved = (role === 'hospital' || role === 'ambulance') ? false : true;
    
    const user = new User({ ...req.body, isApproved, isEmailVerified: true });
    await user.save();
    res.status(201).json({ message: "User registered successfully", user: { id: user._id, name: user.name, email, role: user.role, isApproved } });
  } catch (error: any) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Error registering user", error: error.message || error });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: "Database connection is not ready. Please check MONGODB_URI in settings.",
        dbStatus: mongoose.connection.readyState 
      });
    }

    // Check for pre-defined owner
    if (email === OWNER_EMAIL && password === OWNER_PASSWORD) {
      return res.json({ 
        message: "Login successful", 
        user: { id: "owner-id", name: "System Owner", email: OWNER_EMAIL, role: "owner", isApproved: true } 
      });
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: "Your account is pending approval by the owner." });
    }

    res.json({ message: "Login successful", user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved } });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message || error });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }
    
    // In a real app, send an email with a token here.
    // For this demo, we'll send a simple notification.
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'HealthHaven Password Reset Request',
      text: `Hello ${user.name},\n\nYou requested a password reset for your HealthHaven account. If you did not make this request, please ignore this email.\n\nTo reset your password, please proceed to the reset page in the app.`,
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
        res.json({ message: "Password reset instructions have been sent to your email." });
      } catch (mailError: any) {
        console.error("Forgot Password Email Error:", mailError);
        let errorMessage = "Error sending password reset email";
        let errorDetails = mailError.message;
        
        if (mailError.message.includes('535-5.7.8')) {
          errorMessage = "Gmail authentication failed. You MUST use an 'App Password'.";
          errorDetails = "Go to Google Account > Security > 2-Step Verification > App Passwords.";
        }
        
        res.status(500).json({ 
          message: errorMessage, 
          error: errorDetails,
          code: mailError.code
        });
      }
    } else {
      // Fallback for demo if email is not configured
      res.json({ message: "Password reset instructions have been sent to your email (Demo mode: Email service not configured)." });
    }
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Error processing request", error: error.message || error });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOneAndUpdate({ email }, { password: newPassword }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Password has been reset successfully. You can now login with your new password." });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Error resetting password", error: error.message || error });
  }
});

app.patch("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully", user });
  } catch (error: any) {
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Error updating user", error: error.message || error });
  }
});

app.patch("/api/users/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    const user = await User.findByIdAndUpdate(id, { isApproved }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `User ${isApproved ? 'approved' : 'rejected'} successfully`, user });
  } catch (error: any) {
    console.error("Approval Error:", error);
    res.status(500).json({ message: "Error updating approval status", error: error.message || error });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords
    res.json(users);
  } catch (error: any) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message || error });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    console.log('Received booking request:', req.body);

    // Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: "Database connection is not ready. Please check MONGODB_URI in settings.",
        dbStatus: mongoose.connection.readyState 
      });
    }

    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: "Booking successful", booking });
  } catch (error: any) {
    console.error("Booking Error:", error);
    const msg = error.message || error.toString();
    res.status(500).json({ 
      message: "Error creating booking", 
      error: msg
    });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
});

app.patch("/api/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error updating booking", error });
  }
});

app.get("/api/bookings/user/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user bookings", error });
  }
});

// Ambulance Booking Routes
app.post('/api/ambulance-bookings', async (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const booking = new AmbulanceBooking({ ...req.body, otp });
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error creating ambulance booking", error });
  }
});

app.get('/api/ambulance-bookings', async (req, res) => {
  try {
    const bookings = await AmbulanceBooking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ambulance bookings", error });
  }
});

app.patch('/api/ambulance-bookings/:id', async (req, res) => {
  try {
    const booking = await AmbulanceBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error updating ambulance booking", error });
  }
});

app.get('/api/ambulance-bookings/:id', async (req, res) => {
  try {
    const booking = await AmbulanceBooking.findById(req.params.id);
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ambulance booking", error });
  }
});

// HMS Routes
app.get("/api/hospitals/:hospitalId/stats", async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const bookings = await Booking.find({ hospitalId });
    const doctors = await Doctor.find({ hospitalId });
    const inventory = await Inventory.find({ hospitalId });
    const expenses = await Expense.find({ hospitalId });

    const stats = {
      activePatients: bookings.filter(b => b.status === 'Admitted').length,
      opdCount: bookings.filter(b => b.patientType === 'OPD').length,
      ipdCount: bookings.filter(b => b.patientType === 'IPD').length,
      dischargedCount: bookings.filter(b => b.status === 'Discharged').length,
      totalRevenue: bookings.reduce((acc, curr) => acc + (curr.billingAmount || 0), 0),
      totalExpenses: expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0),
      lowStockItems: inventory.filter(i => i.stock <= i.minStockAlert).length,
      expiringSoon: inventory.filter(i => {
        if (!i.expiryDate) return false;
        const diff = new Date(i.expiryDate).getTime() - new Date().getTime();
        return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // 30 days
      }).length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
});

// Doctors
app.get("/api/hospitals/:hospitalId/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospitalId: req.params.hospitalId });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error });
  }
});

app.post("/api/doctors", async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Error creating doctor", error });
  }
});

// Inventory
app.get("/api/hospitals/:hospitalId/inventory", async (req, res) => {
  try {
    const inventory = await Inventory.find({ hospitalId: req.params.hospitalId });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory", error });
  }
});

app.post("/api/inventory", async (req, res) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Error adding inventory", error });
  }
});

// Expenses
app.get("/api/hospitals/:hospitalId/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find({ hospitalId: req.params.hospitalId });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses", error });
  }
});

app.post("/api/expenses", async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Error adding expense", error });
  }
});

// Feedback
app.get("/api/hospitals/:hospitalId/feedback", async (req, res) => {
  try {
    const feedback = await Feedback.find({ hospitalId: req.params.hospitalId });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback", error });
  }
});

// JSON 404 for any other /api routes
app.all("/api/*", (req, res) => {
  console.warn(`404 - API Route Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    message: `API route not found: ${req.method} ${req.url}`,
    suggestion: "Check if the route is correctly defined in server.ts and the method matches."
  });
});

// Vite Middleware
async function initVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global Error Handler:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err
  });
});

function startServer(port: number) {
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is in use, trying ${port + 1}...`);
      setTimeout(() => startServer(port + 1), 500);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

initVite().then(() => {
  startServer(DEFAULT_PORT);
}).catch((err) => {
  console.error("CRITICAL: Failed to initialize Vite server:", err);
  // Try to start the server anyway to serve API routes
  startServer(DEFAULT_PORT);
});
