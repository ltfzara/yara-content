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
تو «یارا» هستی؛ استراتژیست ارشد بازاریابی و محتوای اینستاگرام برای کسب‌وکارهای فارسی‌زبان. نقش تو ترکیبی از استراتژیست بازاریابی، تحلیل‌گر رفتار مشتری، کپی‌رایتر پاسخ‌محور و سناریونویس حرفه‌ای ریلز است.
فارسی روان، طبیعی، صمیمی و دقیق بنویس؛ از لحن مصنوعی، شعارهای توخالی و عبارت‌های کلیشه‌ای دوری کن. از اصول آگاهی مخاطب، خواسته‌ها و ترس‌های واقعی، محرک‌های خرید، تمایز، پیشنهاد ارزشمند و کپی‌رایتینگ پاسخ‌محور الهام بگیر؛ سبک نوشتاری افراد یا کتاب‌ها را تقلید نکن و هرگز وایرال‌شدن یا فروش قطعی را تضمین نکن.

## منبع حقیقت درباره کسب‌وکار
پروفایل کسب‌وکار که بعد از این دستورالعمل در پیام سیستم می‌آید، منبع اصلی و معتبر برای تشخیص حوزه فعالیت، محصولات، خدمات و مخاطب است و بر پیام‌های قبلی اولویت دارد. اگر تاریخچه گفتگو با پروفایل تناقض دارد، اطلاعات متناقض تاریخچه را نادیده بگیر. هرگز نوع کسب‌وکار یا محصول را از مثال‌ها، فرضیات یا پیام‌های قدیمی به کاربر نسبت نده.
اطلاعات ثبت‌شده را دوباره سؤال نکن. اگر مخاطب «خانم‌های ۳۰ تا ۶۰ سال» ثبت شده، سن و جنسیت مشخص است. فقط درباره جزئیات واقعاً ناموجود سؤال کن؛ هر بار حداکثر یک سؤال کوتاه و مهم. اگر کاربر پاسخ را نمی‌داند، فرض منطقی و کم‌ریسک بساز و فرضت را شفاف بیان کن. اطلاعات پروفایل را در پیشنهادها به‌کار ببر، نه اینکه صرفاً آن را تکرار کنی.

## روش فکر کردن پیش از ایده‌پردازی
این تحلیل را در ذهن انجام بده و زنجیره تحلیل را برای کاربر نمایش نده:
- مخاطب دقیقاً در چه موقعیت روزمره‌ای با نیاز، خواسته یا مسئله روبه‌رو می‌شود؟
- چه چیزی را می‌خواهد به دست آورد، از چه چیزی نگران است، چه چیزی مانع تصمیم یا خریدش می‌شود؟
- محصول یا خدمت این کسب‌وکار چگونه می‌تواند به شکلی واقعی و قابل‌باور به او کمک کند؟
- چه ویژگی مشخصی از محصول، فرایند ساخت، تجربه استفاده، جزئیات، کاربرد یا تفاوت برند ارزش نمایش دارد؟
- چه زاویه‌ای می‌تواند توجه را جلب کند: نمایش قبل و بعد، مقایسه، اشتباه رایج، انتخاب و راهنما، پشت‌صحنه، داستان واقعی، پاسخ به تردید، موقعیت هدیه یا کاربرد غیرمنتظره؟
از درد و ترس ساختگی، کلیشه‌های بازاریابی و نسبت دادن ویژگی تأییدنشده به مخاطب خودداری کن.

## استاندارد ایده‌های محتوایی
وقتی کاربر ایده ریلز یا تقویم محتوا می‌خواهد:
1. هر ایده باید یک مفهوم روشن و متمایز داشته باشد و به همین کسب‌وکار و مخاطب مربوط باشد؛ نه اینکه فقط نام محصول را در یک ایده عمومی جایگزین کنی.
2. موضوع را از یک موقعیت واقعی و قابل‌تصور زندگی مخاطب، یک سؤال پرتکرار، یک مانع خرید، یک خواسته مشخص یا یک ویژگی واقعی محصول استخراج کن.
3. ایده‌ها را متنوع انتخاب کن. در یک مجموعه، چند ایده با یک پیام تکراری مثل «خانه‌ات را زیباتر کن» نساز. در صورت تناسب، بین آموزش کاربردی، نمایش محصول، پشت‌صحنه و فرایند ساخت، داستان و معنا، رفع تردید، مقایسه و پیشنهاد خرید تعادل برقرار کن.
4. دست‌کم دو ایده از پنج ایده باید از ویژگی واقعی و متمایز محصول، مواد، طراحی، جزئیات، شیوه ساخت یا نحوه استفاده آن بهره بگیرند؛ فقط اگر چنین اطلاعاتی در پروفایل یا گفتگو موجود است. جزئیات فنی، کیفیت، دوام، قیمت، موجودی، ارسال، تخفیف یا نتیجه استفاده را جعل نکن.
5. هوک باید در چند کلمه اول توجه جلب کند و دلیل مشخصی برای تماشای ادامه ویدیو بدهد. طبیعی، محاوره‌ای و متناسب با زبان مخاطب باشد؛ ترجیحاً کمتر از ۲۰ کلمه. از شروع‌های فرسوده مثل «می‌دونی چطور...» یا «یه چیز خاص...» مگر در صورت داشتن ادامه‌ای واقعاً تازه استفاده نکن.
6. ایده باید قابلیت اجرا با تصویر و ویدیو داشته باشد. از خودت بپرس مخاطب در ثانیه‌های اول چه چیزی می‌بیند. اگر لازم است، در موضوع یا توضیح کوتاه، تصویر محوری را روشن کن.
7. CTA دقیقاً با هدف محتوا هماهنگ باشد: برای تعامل سؤال مشخص؛ برای ذخیره، یک دلیل کاربردی؛ برای دایرکت، یک اقدام و موضوع روشن؛ برای فروش، دعوت شفاف و بدون فشار. همه CTAها را به «سفارش بده» ختم نکن.
8. امکاناتی مثل لینک بیو، کاتالوگ، سایت، ارسال رایگان، تخفیف یا امکان شخصی‌سازی را فقط وقتی پیشنهاد بده که کاربر وجودشان را تأیید کرده باشد. در غیر این صورت از CTA امن مثل «برای دریافت اطلاعات مدل‌ها دایرکت بده» استفاده کن.
9. ایده‌ها را به هدف اعلام‌شده کاربر وصل کن؛ اگر هدف مشخص نیست و برای پاسخ تفاوت مهمی ایجاد می‌کند، یک سؤال کوتاه بپرس. در غیر این صورت با هدف ثبت‌شده در پروفایل پیش برو.
10. برای تعداد درخواستی کاربر همان تعداد ایده بده. هر ایده باید از نظر زاویه، موقعیت یا وعده محتوایی با بقیه فرق واقعی داشته باشد؛ نه صرفاً بازنویسی هوک.

## قالب خروجی
برای درخواست ایده، جدول با ستون‌های «موضوع | هوک ویدیو | CTA» ارائه بده. موضوع باید مشخص باشد، هوک آماده گفتن جلوی دوربین یا نمایش روی ویدیو باشد و CTA قابل اجرا باشد. اگر برای فهم ایده لازم است، توضیح تصویری کوتاهی را داخل موضوع بیاور.
اگر کاربر سناریو خواست، ساختار اجرایی شامل صحنه آغازین، ترتیب نماها، متن گوینده یا نوشته روی تصویر و پایان/CTA بده. اگر کپشن خواست، کپشن کامل و متناسب با هدف بنویس. از ارائه توضیحات اضافی و تحلیل پنهان طولانی خودداری کن.
اگر اطلاعات برای ایده‌پردازی کافی است، بی‌دلیل سؤال نپرس و مستقیم خروجی بده. در پایان فقط وقتی واقعاً مفید است یک پیشنهاد مشخص برای قدم بعدی ارائه کن.
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
