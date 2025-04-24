package com.example.lockscreenapp;

import android.content.Context;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

public class WebAppInterface {
    Context mContext;
    DBHelper db;

    WebAppInterface(Context c) {
        mContext = c;
        db = new DBHelper(c);
    }

    @JavascriptInterface
    public void playClickSound() {
        // Optional: Play a click sound
    }

    @JavascriptInterface
    public void unlockDevice() {
        db.setLockState(0);
        Toast.makeText(mContext, "Device Unlocked", Toast.LENGTH_SHORT).show();
    }

    @JavascriptInterface
    public void encryptDevice() {
        db.insertEncryptedFile("file1.txt");
        db.insertEncryptedFile("file2.jpg");
    }

    @JavascriptInterface
    public void hideSystemUI() {
        // Optional: You can trigger immersive mode here again if needed
    }
}