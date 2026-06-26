import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client on the server
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiConfigured: !!aiClient });
});

// Endpoint: Auto-generate OKR & KPI using Gemini-3.5-flash with structured JSON response schema
app.post("/api/generate-okr-kpi", async (req: express.Request, res: express.Response) => {
  try {
    const { name, role, type, direction } = req.body;

    if (!name || !role) {
      res.status(400).json({ error: "Missing required fields: name and role" });
      return;
    }

    if (!aiClient) {
      res.status(503).json({ 
        error: "Gemini API key is not configured in environment. Please add GEMINI_API_KEY to your secrets." 
      });
      return;
    }

    const typeLabel = type === "GiaoVien" ? "Giáo viên giảng dạy" : type === "NhanVien" ? "Nhân viên hành chính/hỗ trợ" : "Ban Giám Hiệu";
    
    const prompt = `Bạn là một chuyên gia quản trị giáo dục hàng đầu tại Việt Nam, chuyên sâu về thiết lập mục tiêu OKR và chỉ số KPI cho cán bộ giáo viên nhân viên (CBGV-NV) cấp THCS.
Hãy tạo 01 mục tiêu OKR đổi mới sáng tạo (bao gồm 3 kết quả then chốt định lượng) và 03 chỉ số KPI vận hành thường nhật định lượng cho nhân sự sau:
- Họ và tên: ${name}
- Vị trí công tác / Môn dạy: ${role}
- Phân loại nhân sự: ${typeLabel}
- Định hướng giao việc của BGH / Tổ trưởng: ${direction || "Nâng cao chất lượng chuyên môn, chủ động chuyển đổi số giảng dạy/làm việc."}

Yêu cầu chi tiết:
1. Bộ mục tiêu OKR phải mang tính đổi mới, định hướng bứt phá hoặc cải tiến quy trình học kỳ này.
2. 3 kết quả then chốt (KR1, KR2, KR3) của OKR bắt buộc phải có con số đo lường cụ thể (%, số lượng tệp, số giờ, thứ hạng...).
3. 3 chỉ số KPI vận hành đại diện cho các mặt hoạt động cốt lõi hàng ngày của vị trí đó (ví dụ: soạn bài, lên lớp, hồ sơ tài chính, vệ sinh học đường, nề nếp kỷ luật). Tổng trọng số (weight) của 3 KPI này phải bằng chính xác 100 (ví dụ: 40, 30, 30 hoặc 40, 40, 20).
4. Ngôn ngữ hoàn toàn bằng tiếng Việt, diễn đạt chuyên nghiệp, lịch sự, chuẩn sư phạm Việt Nam.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Bạn là trợ lý đắc lực của Ban Giám Hiệu trường THCS Hòa Phú, chịu trách nhiệm tự động sinh OKR và KPI có tính thực tiễn cao, chi tiết, định lượng cho giáo viên và nhân viên học đường bằng tiếng Việt.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            okr: {
              type: Type.OBJECT,
              properties: {
                title: { 
                  type: Type.STRING, 
                  description: "Mục tiêu lớn đổi mới sáng tạo (Objective), ví dụ: 'Nâng cao năng lực bồi dưỡng HSG và số hóa tài liệu giảng dạy Ngữ văn'." 
                },
                kr1: { 
                  type: Type.STRING, 
                  description: "Kết quả then chốt 1 định lượng có tỉ lệ % hoặc con số, ví dụ: 'Số hóa 100% giáo án, học liệu lên Google Drive.'" 
                },
                kr2: { 
                  type: Type.STRING, 
                  description: "Kết quả then chốt 2 định lượng, ví dụ: 'Ít nhất 2 học sinh đoạt giải Học sinh giỏi cấp huyện.'" 
                },
                kr3: { 
                  type: Type.STRING, 
                  description: "Kết quả then chốt 3 định lượng, ví dụ: 'Thực hiện thành công 2 tiết dạy chuyên đề đổi mới cấp trường.'" 
                }
              },
              required: ["title", "kr1", "kr2", "kr3"]
            },
            kpis: {
              type: Type.ARRAY,
              description: "Danh sách chính xác 3 chỉ số KPI vận hành hằng ngày.",
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion: { 
                    type: Type.STRING, 
                    description: "Tên tiêu chí kèm số thứ tự, ví dụ: '1. Chất lượng chuyên môn giảng dạy' hoặc '2. Kỷ luật hành chính & nề nếp'" 
                  },
                  weight: { 
                    type: Type.INTEGER, 
                    description: "Trọng số phần trăm của tiêu chí (ví dụ: 40, 30). Tổng 3 tiêu chí phải bằng đúng 100." 
                  },
                  desc: { 
                    type: Type.STRING, 
                    description: "Mô tả chi tiết tiêu chí đánh giá, các thước đo cơ bản, ví dụ: 'Đầy đủ giáo án trước khi lên lớp, giảng dạy đúng chương trình, chấm bài đúng hạn.'" 
                  },
                  value: { 
                    type: Type.INTEGER, 
                    description: "Điểm số mặc định lúc khởi tạo (luôn bằng 0)." 
                  }
                },
                required: ["criterion", "weight", "desc", "value"]
              }
            }
          },
          required: ["okr", "kpis"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const data = JSON.parse(text.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Error generating OKR-KPI:", error);
    res.status(500).json({ error: error.message || "Failed to generate OKR and KPI" });
  }
});

// Vite middleware for development or Static Assets for production
const startServer = async () => {
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
