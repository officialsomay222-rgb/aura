package com.pulsemusic.app

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import android.webkit.JavascriptInterface
import android.widget.Toast

class WebAppInterface(private val context: Context) {

    private val tag = "PulseMusicBridge"

    /**
     * Show a native Android Toast notification on the UI thread
     */
    @JavascriptInterface
    fun showToast(message: String) {
        if (context is MainActivity) {
            context.runOnUiThread {
                Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
            }
        } else {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * Trigger native haptic feedback
     */
    @JavascriptInterface
    fun vibrate(durationMs: Long) {
        try {
            val duration = if (durationMs in 1..2000) durationMs else 40L
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                val vibrator = vibratorManager?.defaultVibrator
                vibrator?.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator?.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator?.vibrate(duration)
                }
            }
        } catch (e: Exception) {
            Log.w(tag, "Vibration failed", e)
        }
    }

    /**
     * Returns native APK package version
     */
    @JavascriptInterface
    fun getAppVersion(): String {
        return try {
            val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            pInfo.versionName ?: "1.0.0-apk"
        } catch (e: Exception) {
            "1.0.0-apk"
        }
    }

    /**
     * Open an external link in the device default browser
     */
    @JavascriptInterface
    fun openExternalUrl(url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            Log.e(tag, "Failed to open external URL: $url", e)
        }
    }

    /**
     * Notification callback when track changes
     */
    @JavascriptInterface
    fun notifyTrackChanged(title: String, artist: String, isPlaying: Boolean) {
        Log.d(tag, "Track update: $title by $artist (Playing: $isPlaying)")
    }
}
