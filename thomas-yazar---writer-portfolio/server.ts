import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.get("/api/works", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("works")
        .select("*")
        .order("dateCreated", { ascending: false });
      
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching works:", error);
      res.status(500).json({ error: "Failed to fetch works" });
    }
  });

  app.post("/api/works", async (req, res) => {
    try {
      const newWork = req.body;
      console.log(`Attempting to save work: ${newWork.title}`);
      
      const { data, error } = await supabase
        .from("works")
        .upsert(newWork)
        .select();
      
      if (error) {
        console.error("Supabase error:", error);
        return res.status(400).json({ 
          error: "Supabase rejected the save", 
          message: error.message,
          hint: error.hint,
          details: error.details
        });
      }
      
      console.log("Work saved successfully");
      
      // Fetch all works to return updated list
      const { data: allWorks, error: fetchError } = await supabase
        .from("works")
        .select("*")
        .order("dateCreated", { ascending: false });
        
      if (fetchError) throw fetchError;
        
      res.json(allWorks || []);
    } catch (error: any) {
      console.error("Error saving work:", error);
      res.status(500).json({ 
        error: "Failed to save work", 
        message: error?.message || "Internal server error"
      });
    }
  });

  app.delete("/api/works/:id", async (req, res) => {
    try {
      const { error } = await supabase
        .from("works")
        .delete()
        .eq("id", req.params.id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting work:", error);
      res.status(500).json({ error: "Failed to delete work" });
    }
  });

  app.post("/api/works/:id/view", async (req, res) => {
    try {
      // Get current views
      const { data: work } = await supabase
        .from("works")
        .select("views")
        .eq("id", req.params.id)
        .single();
      
      const newViews = (work?.views || 0) + 1;
      
      await supabase
        .from("works")
        .update({ views: newViews })
        .eq("id", req.params.id);
      
      const { data: allWorks } = await supabase
        .from("works")
        .select("*")
        .order("dateCreated", { ascending: false });
        
      res.json(allWorks || []);
    } catch (error) {
      console.error("Error updating views:", error);
      res.status(500).json({ error: "Failed to update views" });
    }
  });

  app.post("/api/works/:id/download", async (req, res) => {
    try {
      const { data: work } = await supabase
        .from("works")
        .select("downloads")
        .eq("id", req.params.id)
        .single();
      
      const newDownloads = (work?.downloads || 0) + 1;
      
      await supabase
        .from("works")
        .update({ downloads: newDownloads })
        .eq("id", req.params.id);
      
      const { data: allWorks } = await supabase
        .from("works")
        .select("*")
        .order("dateCreated", { ascending: false });
        
      res.json(allWorks || []);
    } catch (error) {
      console.error("Error updating downloads:", error);
      res.status(500).json({ error: "Failed to update downloads" });
    }
  });

  app.get("/api/access-code", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "accessCode")
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"
      res.json({ code: data?.value || process.env.VITE_ACCESS_CODE || "MEMBER2026" });
    } catch (error) {
      console.error("Error fetching access code:", error);
      res.json({ code: process.env.VITE_ACCESS_CODE || "MEMBER2026" });
    }
  });

  app.post("/api/access-code", async (req, res) => {
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({ key: "accessCode", value: req.body.code }, { onConflict: 'key' });
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving access code:", error);
      res.status(500).json({ error: "Failed to save access code" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const expectedUsername = process.env.ADMIN_USERNAME || "ProseAdmin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "Master&Commander2026";

    if (username.toLowerCase() === expectedUsername.toLowerCase() && password === expectedPassword) {
      res.json({ success: true, role: 'admin', username: 'Admin' });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*splat", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
