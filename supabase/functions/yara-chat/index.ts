// Supabase Edge Function: yara-chat
// Deploy with: supabase functions deploy yara-chat
// Set secret: supabase secrets set GEMINI_API_KEY=your_key
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const SYSTEM = `
تو «یارا» هستی؛ استراتژیست محتوای اینستاگرام برای کسب‌وکارهای فارسی‌زبان.
فارسی روان، طبیعی، صمیمی و دقیق بنویس. نقش تو ترکیبی از استراتژیست بازاریابی، تحلیل‌گر رفتار مشتری، کپی‌رایتر پاسخ‌محور و سناریونویس ریلز است.
از اصول آگاهی مخاطب، نتیجه مطلوب، محرک‌های واقعی زندگی، تمایز، پیشنهاد ارزشمند و دعوت به اقدام الهام بگیر؛ نام افراد یا کتاب‌ها را بی‌دلیل ذکر نکن و ادعای تضمین وایرال شدن نداشته باش.

پروفایل کسب‌وکار را به عنوان زمینه در نظر بگیر. اطلاعات ناقص را با سؤال‌های کوتاه و محاوره‌ای تکمیل کن. در شروع، به جای پرسیدن یک فرم طولانی، هر بار فقط مهم‌ترین سؤال بعدی را بپرس. موضوع کسب‌وکار، مخاطب، نتیجه‌ای که مخاطب می‌خواهد، راه‌حل فعلی او، مزیت متفاوت برند و هدف محتوا را به‌تدریج کشف کن. اگر کاربر نمی‌داند، با یک فرض منطقی پیش برو و فرضت را شفاف بگو.

وقتی اطلاعات کافی شد، پیشنهادها باید مشخص، قابل‌تصویر و برگرفته از موقعیت‌های واقعی زندگی مخاطب باشند؛ نه موضوعات کلی مثل موفقیت، انگیزه یا رشد. برای ریلز، هوک طبیعی و کنجکاوی‌برانگیز بده؛ CTA باید با هدف محتوا هماهنگ باشد. از تکرار ایده‌ها و کلیشه‌ها پرهیز کن.
اگر کاربر ایده یا برنامه محتوا می‌خواهد، خروجی را در جدول با ستون‌های «موضوع | هوک ویدیو | CTA» ارائه بده. اگر سناریو، کپشن یا متن مشخص خواست، همان خروجی را کامل و کاربردی تولید کن.
پاسخ را با تحلیل پنهان طولانی نکن؛ فقط نتیجه و در صورت نیاز یک سؤال بعدی را نشان بده.
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "ابتدا وارد حساب کاربری شو." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) return json({ error: "نشست معتبر نیست؛ دوباره وارد شو." }, 401);

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return json({ error: "کلید Gemini هنوز در Secrets تابع تنظیم نشده است." }, 503);

    const body = await req.json();
    const message = String(body.message ?? "").trim().slice(0, 6000);
    if (!message) return json({ error: "پیامت خالی است." }, 400);

    const profile = body.profile && typeof body.profile === "object" ? body.profile : {};
    const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
    const profileText = Object.entries(profile)
      .filter(([, value]) => typeof value === "string" && value.trim())
      .map(([key, value]) => `${key}: ${String(value).slice(0, 1200)}`)
      .join("\n");

    const contents = [
      { role: "user", parts: [{ text: "زمینه کسب‌وکار کاربر:\n" + (profileText || "هنوز پروفایل تکمیل نشده است.") }] },
      ...history.filter((item: any) => ["user", "assistant"].includes(item?.role) && typeof item?.content === "string")
        .map((item: any) => ({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.content.slice(0, 5000) }],
        })),
    ];
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents,
        generationConfig: { temperature: 0.8, maxOutputTokens: 1800 },
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Gemini API error", response.status, result);
      return json({ error: response.status === 429
        ? "سهمیه رایگان فعلاً پر شده؛ کمی بعد دوباره امتحان کن."
        : "ارتباط با سرویس هوش مصنوعی ناموفق بود. تنظیمات کلید و مدل را بررسی کن." }, 502);
    }
    const reply = result?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("").trim();
    if (!reply) return json({ error: "مدل پاسخی برنگرداند؛ دوباره تلاش کن." }, 502);
    return json({ reply });
  } catch (error) {
    console.error(error);
    return json({ error: "خطای غیرمنتظره در پردازش پیام." }, 500);
  }
});
