package com.example.lockscreenapp;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.content.ContentValues;
import android.database.Cursor;

public class LockDatabaseHelper extends SQLiteOpenHelper {

    private static final String DB_NAME = "lockscreen.db";
    private static final int DB_VERSION = 1;

    private static final String TABLE = "lock_state";
    private static final String COL_ID = "id";
    private static final String COL_LOCKED = "is_locked";

    public LockDatabaseHelper(Context context) {
        super(context, DB_NAME, null, DB_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE " + TABLE + " (" +
                COL_ID + " INTEGER PRIMARY KEY, " +
                COL_LOCKED + " INTEGER DEFAULT 1)");
        db.execSQL("INSERT INTO " + TABLE + " (" + COL_ID + ", " + COL_LOCKED + ") VALUES (1, 1)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // Not needed now
    }

    public boolean isLocked() {
        SQLiteDatabase db = getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT " + COL_LOCKED + " FROM " + TABLE + " WHERE " + COL_ID + "=1", null);
        boolean locked = true;
        if (cursor.moveToFirst()) {
            locked = cursor.getInt(0) == 1;
        }
        cursor.close();
        return locked;
    }

    public void setLocked(boolean locked) {
        SQLiteDatabase db = getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COL_LOCKED, locked ? 1 : 0);
        db.update(TABLE, values, COL_ID + "=1", null);
    }
}