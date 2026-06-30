// فایل drizzle.config.ts

import 'dotenv/config'; // 👈👈👈 این مهم‌ترین چیزیه که باید حتماً اضافه شه
import { defineConfig } from "drizzle-kit";

// این تیکه کمکمون میکنه که اگه مشکلی بود زودتر از کرش شدن ببینیمش!
if (!process.env.DATABASE_URL) {
  console.log("🚨 اخطار: من فایل محیطی دیتابیس رو نمی‌بینم، مطمعن باش که متغیر دیتابیس صحیح و در مکان درست وارد شده باشه!");
}

export default defineConfig({
  schema: "./src/db/schema.ts", // مسیر ساخت اسکیما ممکنه متفاوت باشه اما اکثراً همینه. اگر توی پروژه تغییرش داده بودین به آدرس قبلیتون تغییرش بدین.
  out: "./src/db/migrations",   // مسیر فایلی خروجی
  dialect: "postgresql",        // ابزار رو روی حالت پست‌گرس قرار می‌ده
  dbCredentials: {
    url: process.env.DATABASE_URL!, // متصل به کدهای شما در ویندوز از طریق فراخوانِ سطر یک. (علامت ! هم ضروریه)
  },
  verbose: true,  
  strict: true,   
});