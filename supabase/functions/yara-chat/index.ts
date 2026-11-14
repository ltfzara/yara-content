// Supabase Edge Function: yara-chat
// Deploy with: supabase functions deploy yara-chat
// Set secret: AVALAI_API_KEY (in Supabase Edge Function Secrets)
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

پروفایل کسب‌وکار که در ادامه پیام سیستم می‌آید، تنها منبع معتبر برای تشخیص نوع و حوزه کسب‌وکار، محصولات و مخاطب است. این پروفایل از پیام‌های قبلی گفتگو اولویت بالاتری دارد. اگر پیام‌های قدیمی با پروفایل تناقض دارند، آن‌ها را نادیده بگیر و فقط از پروفایل پیروی کن. هرگز نوع کسب‌وکار، محصول یا خدمتی را حدس نزن یا از روی مثال‌های گفتگو به کاربر نسبت نده. اگر پروفایل می‌گوید فروشنده آثار هنری است، هرگز او را فروشنده لباس معرفی نکن. اگر فیلد مربوط به نوع کسب‌وکار خالی است، پیش‌فرض نساز و فقط یک سؤال کوتاه بپرس.
قبل از هر پاسخ، پروفایل را دقیق بخوان و اطلاعات موجود را به خاطر بسپار.
قانون بسیار مهم: هرگز درباره اطلاعاتی که در پروفایل مقدار دارند دوباره سؤال نپرس؛ نه مستقیم و نه با بیان متفاوت. اگر سن مخاطب، جنسیت، حوزه فعالیت، محصولات یا هر ویژگی دیگری ثبت شده، آن را دانسته فرض کن و در پیشنهادها به کار ببر.
فقط درباره جزئیاتی سؤال کن که واقعاً در پروفایل نیستند. اگر بخشی از اطلاعات ناقص است، فقط همان بخش ناقص را با یک سؤال کوتاه روشن کن و اطلاعات ثبت‌شده را دوباره نپرس.
مثال: اگر مخاطب هدف «خانم‌های ۳۰ تا ۶۰ سال» است، سن و جنسیت مخاطب مشخص است؛ دیگر نپرس مشتری‌ها چند ساله‌اند یا خانم هستند یا نه. اگر برای ایده‌پردازی دانستن سبک لباس لازم است و در پروفایل نیست، فقط درباره سبک لباس سؤال کن.
در شروع، به جای پرسیدن یک فرم طولانی، هر بار فقط مهم‌ترین سؤالِ بی‌پاسخ را بپرس. اگر کاربر نمی‌داند، با یک فرض منطقی پیش برو و فرضت را شفاف بگو.

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
    const anonKey = req.headers.get("apikey") ?? Deno.env.get("SUPABASE_ANON_KEY");
    if (!anonKey) return json({ error: "کلید عمومی Supabase در درخواست موجود نیست." }, 401);
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData.user) return json({ error: "نشست معتبر نیست؛ دوباره وارد شو." }, 401);

    const apiKey = Deno.env.get("AVALAI_API_KEY");
    if (!apiKey) return json({ error: "کلید AvalAI هنوز در Secrets تابع تنظیم نشده است." }, 503);

    const body = await req.json();
    const message = String(body.message ?? "").trim().slice(0, 6000);
    if (!message) return json({ error: "پیامت خالی است." }, 400);

    // Always load the latest saved business profile from Supabase.
    // The authenticated user's RLS policies scope this query to their own data.
    const { data: savedProfile, error: profileError } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (profileError) {
      console.error("Business profile lookup failed", profileError);
      return json({ error: "دریافت پروفایل کسب‌وکار ناموفق بود؛ دوباره تلاش کن." }, 500);
    }
    const profile = savedProfile ?? {};
    const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
    // Send only meaningful business fields, with clear Persian labels.
    const profileLabels: Record<string, string> = {
      business_name: "نام کسب‌وکار",
      instagram_handle: "آیدی اینستاگرام",
      business_type: "حوزه فعالیت",
      products_services: "محصولات یا خدمات",
      target_audience: "مخاطب هدف (اطلاعات ثبت‌شده و قطعی)",
      audience_desired_result: "نتیجه مطلوب مخاطب",
      business_differentiator: "مزیت و تفاوت کسب‌وکار",
      content_goal: "هدف محتوا",
      brand_voice: "لحن برند",
    };
    const profileText = Object.entries(profileLabels)
      .map(([key, label]) => {
        const value = profile[key];
        return typeof value === "string" && value.trim()
          ? `${label}: ${value.trim().slice(0, 1200)}`
          : "";
      })
      .filter(Boolean)
      .join("\n");

    const messages = [
      { role: "system", content: SYSTEM + "\n\nزمینه کسب‌وکار کاربر:\n" + (profileText || "هنوز پروفایل تکمیل نشده است.") },
      ...history.filter((item: any) => ["user", "assistant"].includes(item?.role) && typeof item?.content === "string")
        .map((item: any) => ({ role: item.role, content: item.content.slice(0, 5000) })),
      { role: "user", content: message },
    ];

    // AvalAI offers an OpenAI-compatible Chat Completions API. Use its
    // Cloudflare-backed endpoint for deployments outside Iran.
    const response = await fetch("https://api.avalai.org/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: Deno.env.get("AVALAI_MODEL") || "gpt-4.1-mini",
        messages,
        temperature: 0.8,
        max_tokens: 1800,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("AvalAI API error", response.status, result?.error?.message ?? result?.message ?? "No provider message");
      return json({ error: response.status === 429
        ? "محدودیت یا سهمیه درخواست‌های AvalAI فعلاً پر شده؛ اعتبار و محدودیت مدل را بررسی کن و کمی بعد دوباره امتحان کن."
        : response.status === 401 || response.status === 403
          ? "کلید AvalAI معتبر نیست یا دسترسی لازم را ندارد؛ مقدار Secret را بررسی کن."
          : "ارتباط با سرویس هوش مصنوعی ناموفق بود. نام مدل و تنظیمات AvalAI را بررسی کن." }, 502);
    }
    const reply = result?.choices?.[0]?.message?.content?.trim?.();
    if (!reply) return json({ error: "مدل پاسخی برنگرداند؛ دوباره تلاش کن." }, 502);
    return json({ reply });
  } catch (error) {
    console.error(error);
    return json({ error: "خطای غیرمنتظره در پردازش پیام." }, 500);
  }
});
