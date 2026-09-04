package com.pulsemusic.app

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.WindowInsetsController
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebViewAssetLoader

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private val tag = "PulseMusicNative"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        try {
            configureSystemBars()
        } catch (e: Exception) {
            Log.w(tag, "Failed to configure status bar colors safely", e)
        }

        try {
            webView = WebView(this)
            setContentView(webView)

            // Setup WebViewAssetLoader to serve local APK assets securely
            val assetLoader = WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
                .build()

            configureWebSettings(webView.settings)

            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
            webView.setBackgroundColor(Color.parseColor("#07080C"))

            // Add Javascript Bridge for Kotlin-to-JS communication
            webView.addJavascriptInterface(WebAppInterface(this), "AndroidBridge")

            // Intercept requests for local assets
            webView.webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(
                    view: WebView,
                    request: WebResourceRequest
                ): WebResourceResponse? {
                    return assetLoader.shouldInterceptRequest(request.url)
                }

                override fun onReceivedError(
                    view: WebView?,
                    errorCode: Int,
                    description: String?,
                    failingUrl: String?
                ) {
                    Log.e(tag, "WebView Error: $description on URL $failingUrl")
                    // Fallback to direct file url if virtual host fails on older device WebView
                    if (failingUrl?.contains("appassets.androidplatform.net") == true) {
                        view?.loadUrl("file:///android_asset/web/index.html")
                    }
                }
            }

            webView.webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
                    Log.d("PulseWebConsole", "${consoleMessage.message()} -- line ${consoleMessage.lineNumber()} of ${consoleMessage.sourceId()}")
                    return true
                }
            }

            // Handle hardware back button
            onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    if (::webView.isInitialized && webView.canGoBack()) {
                        webView.goBack()
                    } else {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                    }
                }
            })

            // Load the locally compiled bundle from APK assets
            val targetUrl = "https://appassets.androidplatform.net/assets/web/index.html"
            Log.i(tag, "Loading compiled web application bundle from: $targetUrl")
            webView.loadUrl(targetUrl)

        } catch (e: Exception) {
            Log.e(tag, "Fatal error during MainActivity initialization", e)
            throw e
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebSettings(settings: WebSettings) {
        settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true

            @Suppress("DEPRECATION")
            allowFileAccessFromFileURLs = true
            @Suppress("DEPRECATION")
            allowUniversalAccessFromFileURLs = true

            mediaPlaybackRequiresUserGesture = false
            loadWithOverviewMode = true
            useWideViewPort = true
            cacheMode = WebSettings.LOAD_DEFAULT
            userAgentString = "$userAgentString PulseMusic-Native/1.0"
        }
    }

    private fun configureSystemBars() {
        window.statusBarColor = Color.parseColor("#07080C")
        window.navigationBarColor = Color.parseColor("#07080C")

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.insetsController?.setSystemBarsAppearance(0, WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS)
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = 0
        }
    }

    override fun onResume() {
        super.onResume()
        if (::webView.isInitialized) webView.onResume()
    }

    override fun onPause() {
        super.onPause()
        if (::webView.isInitialized) webView.onPause()
    }

    override fun onDestroy() {
        if (::webView.isInitialized) webView.destroy()
        super.onDestroy()
    }
}
