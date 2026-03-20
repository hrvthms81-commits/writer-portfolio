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
      // Exclude heavy fields (pdf_content) from the initial list fetch
      const { data, error } = await supabase
        .from("works")
        .select("id, title, category, description, cover_image, date_created, is_locked, views, downloads")
        .order("date_created", { ascending: false });
      
      if (error) throw error;
      
      // Map back to camelCase for frontend
      const works = (data || []).map(w => ({
        id: w.id,
        title: w.title,
        category: w.category,
        description: w.description,
        coverImage: w.cover_image,
        dateCreated: w.date_created,
        isLocked: w.is_locked,
        views: w.views,
        downloads: w.downloads
      }));
      
      res.json(works);
    } catch (error) {
      console.error("Error fetching works:", error);
      res.status(500).json({ error: "Failed to fetch works" });
    }
  });

  app.get("/api/works/:id", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("works")
        .select("*")
        .eq("id", req.params.id)
        .single();
      
      if (error) throw error;
      
      const work = {
        id: data.id,
        title: data.title,
        category: data.category,
        description: data.description,
        coverImage: data.cover_image,
        pdfContent: data.pdf_content,
        content: data.content,
        dateCreated: data.date_created,
        isLocked: data.is_locked,
        views: data.views,
        downloads: data.downloads
      };
      
      res.json(work);
    } catch (error) {
      console.error("Error fetching work details:", error);
      res.status(500).json({ error: "Failed to fetch work details" });
    }
  });

  app.post("/api/works", async (req, res) => {
    try {
      const work = req.body;
      console.log(`Attempting to save work: ${work.title}`);
      
      // Map frontend camelCase to database snake_case
      const dbWork = {
        id: work.id,
        title: work.title,
        category: work.category,
        description: work.description,
        cover_image: work.coverImage,
        pdf_content: work.pdfContent,
        content: work.content,
        date_created: work.dateCreated,
        is_locked: work.isLocked,
        views: work.views || 0,
        downloads: work.downloads || 0
      };
      
      const { data, error } = await supabase
        .from("works")
        .upsert(dbWork)
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
        .order("date_created", { ascending: false });
        
      if (fetchError) throw fetchError;
      
      // Map back to camelCase for frontend
      const mappedWorks = (allWorks || []).map(w => ({
        id: w.id,
        title: w.title,
        category: w.category,
        description: w.description,
        coverImage: w.cover_image,
        pdfContent: w.pdf_content,
        content: w.content,
        dateCreated: w.date_created,
        isLocked: w.is_locked,
        views: w.views,
        downloads: w.downloads
      }));
        
      res.json(mappedWorks);
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
        .select("id, title, category, description, cover_image, date_created, is_locked, views, downloads")
        .order("date_created", { ascending: false });
        
      // Map back to camelCase for frontend
      const mappedWorks = (allWorks || []).map(w => ({
        id: w.id,
        title: w.title,
        category: w.category,
        description: w.description,
        coverImage: w.cover_image,
        dateCreated: w.date_created,
        isLocked: w.is_locked,
        views: w.views,
        downloads: w.downloads
      }));
        
      res.json(mappedWorks);
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
        .select("id, title, category, description, cover_image, date_created, is_locked, views, downloads")
        .order("date_created", { ascending: false });
        
      // Map back to camelCase for frontend
      const mappedWorks = (allWorks || []).map(w => ({
        id: w.id,
        title: w.title,
        category: w.category,
        description: w.description,
        coverImage: w.cover_image,
        dateCreated: w.date_created,
        isLocked: w.is_locked,
        views: w.views,
        downloads: w.downloads
      }));
        
      res.json(mappedWorks);
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

  app.get("/api/messages", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("date_created", { ascending: false });
      
      if (error) throw error;
      
      const messages = (data || []).map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        message: m.message,
        dateCreated: m.date_created,
        isRead: m.is_read
      }));
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const msg = req.body;
      
      // Server-side validation
      if (!msg.message || msg.message.length > 200) {
        return res.status(400).json({ error: "Message is too long (max 200 characters)." });
      }

      const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
      if (urlRegex.test(msg.message)) {
        return res.status(400).json({ error: "Links are not allowed in the message." });
      }

      // Use ISO string for better compatibility with SQL TIMESTAMP columns
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("messages")
        .insert({
          name: msg.name,
          email: msg.email,
          message: msg.message,
          date_created: now,
          is_read: false
        })
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error saving message:", error);
        return res.status(400).json({ 
          error: "Failed to save message", 
          details: error.message,
          hint: "Ensure the 'messages' table exists with columns: id, name, email, message, date_created (TIMESTAMP), is_read (BOOLEAN)"
        });
      }
      res.json(data);
    } catch (error: any) {
      console.error("Error saving message:", error);
      res.status(500).json({ error: "Failed to save message", message: error?.message });
    }
  });

  app.post("/api/messages/:id/read", async (req, res) => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", req.params.id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ error: "Failed to mark message as read" });
    }
  });

  app.delete("/api/messages/:id", async (req, res) => {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", req.params.id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ error: "Failed to delete message" });
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
