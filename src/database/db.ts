import { INoteData } from "@/shared/types"; 
// استيراد نوع البيانات INoteData (يحتوي على شكل الملاحظة، مثلاً id و note)

import sqlite3 from "sqlite3";
// استيراد مكتبة sqlite3 للتعامل مع قاعدة بيانات SQLite

const db = new sqlite3.Database('notes.sql');
// إنشاء اتصال بقاعدة بيانات اسمها notes.sql (أو إنشاؤها إذا ما كانت موجودة)

const create_notes_table = () => {
    // دالة تنشئ جدول الملاحظات إذا ما كان موجود
    db.run("CREATE TABLE IF NOT EXISTS notes (id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT, note TEXT)");
    // الجدول يحتوي على عمودين: id (رقم تلقائي) و note (نص الملاحظة)
}

export const set_notes = (data: INoteData, callback: Function) => {
    // دالة لإضافة أو تعديل ملاحظة في قاعدة البيانات
    db.serialize(() => { 
        // serialize: تجعل العمليات تنفذ بترتيب متسلسل (واحدة تلو الأخرى)
        create_notes_table(); 
        // تأكد أن الجدول موجود قبل أي عملية

        const stmt = db.prepare("INSERT OR REPLACE INTO notes (id,note) VALUES ((SELECT id FROM notes WHERE id = ?),?)");
        // تجهيز استعلام لإضافة أو استبدال ملاحظة بناءً على id (إذا كانت موجودة يتم استبدالها)
        
        stmt.run(data.id, JSON.stringify(data.note));
        // تنفيذ الاستعلام مع تمرير القيم (id و note)
        
        stmt.finalize();
        // إنهاء الـ statement وتحرير الموارد
        
        get_all_notes(callback);
        // بعد الحفظ، جلب جميع الملاحظات وإرسالها عبر callback
    });
}

export const get_all_notes = (callback: Function) => {
    // دالة لجلب جميع الملاحظات من قاعدة البيانات
    db.serialize(() => {
        create_notes_table();
        // تأكد من وجود الجدول
        
        db.all("SELECT * FROM notes ORDER BY id DESC", (err, data) => {
            // تنفيذ استعلام لجلب جميع الملاحظات مرتبة تنازلياً حسب id
            if (err) return null; 
            // إذا صار خطأ، توقف بدون إرجاع بيانات

                const parsed: INoteData[] = data.map((row: any) => ({
                id: row.id,
                note: JSON.parse(row.note)
                }));
          callback(parsed);
            // استدعاء الدالة callback مع البيانات التي تم جلبها
        });
    });
}

export const get_note = (note_id: string, callback: Function) => {
    console.log("📥 get_note CALLED with note_id =", note_id);

    db.serialize(() => {
        create_notes_table();

        console.log("➡️ Executing SQL: SELECT * FROM notes WHERE id = ?", note_id);

        db.get("SELECT * FROM notes WHERE id = ?", [note_id], (err, data) => {

            if (err) {
                console.log("❌ SQL ERROR:", err);
                return callback(null);
            }

            if (!data) {
                console.log("⚠️ No note found for id:", note_id);
                return callback(null);
            }

            console.log("✅ SQL RESULT:", data);

            callback(data);
        });
    });
}

export const delete_note = (note_id: string, callback: Function) => {
    // دالة لحذف ملاحظة من قاعدة البيانات حسب رقمها
    db.serialize(() => {
        create_notes_table();
        // تأكد من وجود الجدول
        
        const stmt = db.prepare("DELETE FROM notes WHERE id=?");
        // تجهيز استعلام الحذف
        
        stmt.run(note_id);
        // تنفيذ عملية الحذف
        
        stmt.finalize();
        // إنهاء statement وتحرير الذاكرة
        
        get_all_notes(callback);
        // بعد الحذف، جلب جميع الملاحظات المتبقية وإرسالها إلى callback
    });
}

// db.close(); 
// يمكن إغلاق الاتصال بقاعدة البيانات بعد الانتهاء من كل العمليات (لكن الأفضل عدم غلقها هنا أثناء التشغيل)
