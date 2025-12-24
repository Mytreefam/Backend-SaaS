# ============================================================================
# UDAR EDGE - ProGuard Rules
# ============================================================================
# Configuración de ofuscación y optimización para Android Release
# ============================================================================

# ----------------------------------------------------------------------------
# REGLAS BÁSICAS
# ----------------------------------------------------------------------------

# No ofuscar
-dontobfuscate

# Optimizaciones agresivas
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification

# Mantener números de línea para stack traces legibles
-keepattributes SourceFile,LineNumberTable

# Renombrar archivos de código fuente a "SourceFile"
-renamesourcefileattribute SourceFile

# ----------------------------------------------------------------------------
# ANDROID BASE
# ----------------------------------------------------------------------------

# Mantener clases nativas de Android
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
-keep public class * extends android.view.View

# Mantener constructores de View personalizados
-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet);
}
-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# Mantener setters de View
-keepclassmembers public class * extends android.view.View {
    void set*(***);
    *** get*();
}

# Mantener Activity
-keepclassmembers class * extends android.app.Activity {
    public void *(android.view.View);
}

# Mantener enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Mantener Parcelable
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Mantener Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ----------------------------------------------------------------------------
# CAPACITOR - CORE
# ----------------------------------------------------------------------------

# Mantener todos los plugins de Capacitor
-keep class com.getcapacitor.** { *; }
-keepclassmembers class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# Mantener interfaz de JavaScript bridge
-keepclassmembers class * {
    @com.getcapacitor.annotation.CapacitorPlugin <methods>;
}
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }

# Mantener WebView
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin { *; }

# ----------------------------------------------------------------------------
# CAPACITOR - PLUGINS
# ----------------------------------------------------------------------------

# @capacitor/camera
-keep class com.getcapacitor.plugin.camera.** { *; }
-dontwarn com.getcapacitor.plugin.camera.**

# @capacitor/geolocation
-keep class com.getcapacitor.plugin.geolocation.** { *; }
-dontwarn com.getcapacitor.plugin.geolocation.**

# @capacitor/filesystem
-keep class com.getcapacitor.plugin.filesystem.** { *; }
-dontwarn com.getcapacitor.plugin.filesystem.**

# @capacitor/push-notifications
-keep class com.getcapacitor.plugin.pushnotifications.** { *; }
-dontwarn com.getcapacitor.plugin.pushnotifications.**

# @capacitor/local-notifications
-keep class com.getcapacitor.plugin.localnotifications.** { *; }
-dontwarn com.getcapacitor.plugin.localnotifications.**

# @capacitor/splash-screen
-keep class com.getcapacitor.plugin.splashscreen.** { *; }
-dontwarn com.getcapacitor.plugin.splashscreen.**

# @capacitor/status-bar
-keep class com.getcapacitor.plugin.statusbar.** { *; }
-dontwarn com.getcapacitor.plugin.statusbar.**

# @capacitor/keyboard
-keep class com.getcapacitor.plugin.keyboard.** { *; }
-dontwarn com.getcapacitor.plugin.keyboard.**

# @capacitor/haptics
-keep class com.getcapacitor.plugin.haptics.** { *; }
-dontwarn com.getcapacitor.plugin.haptics.**

# @capacitor/share
-keep class com.getcapacitor.plugin.share.** { *; }
-dontwarn com.getcapacitor.plugin.share.**

# @capacitor/app
-keep class com.getcapacitor.plugin.app.** { *; }
-dontwarn com.getcapacitor.plugin.app.**

# @capacitor/device
-keep class com.getcapacitor.plugin.device.** { *; }
-dontwarn com.getcapacitor.plugin.device.**

# @capacitor/network
-keep class com.getcapacitor.plugin.network.** { *; }
-dontwarn com.getcapacitor.plugin.network.**

# @capacitor/browser
-keep class com.getcapacitor.plugin.browser.** { *; }
-dontwarn com.getcapacitor.plugin.browser.**

# ----------------------------------------------------------------------------
# BIOMETRÍA - FINGERPRINT
# ----------------------------------------------------------------------------

# Mantener clases de biometría
-keep class androidx.biometric.** { *; }
-dontwarn androidx.biometric.**

-keep class com.epicshaggy.biometric.** { *; }
-dontwarn com.epicshaggy.biometric.**

# @capacitor-community/biometric
-keep class com.aparajita.capacitor.biometric.** { *; }
-dontwarn com.aparajita.capacitor.biometric.**

# ----------------------------------------------------------------------------
# GOOGLE - FIREBASE
# ----------------------------------------------------------------------------

# Firebase Core
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Firebase Cloud Messaging (Push Notifications)
-keep class com.google.firebase.messaging.** { *; }
-dontwarn com.google.firebase.messaging.**

# Firebase Analytics
-keep class com.google.firebase.analytics.** { *; }
-dontwarn com.google.firebase.analytics.**

# Firebase Crashlytics
-keep class com.google.firebase.crashlytics.** { *; }
-dontwarn com.google.firebase.crashlytics.**

# ----------------------------------------------------------------------------
# GOOGLE - PLAY SERVICES
# ----------------------------------------------------------------------------

# Google Play Services Base
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Google Maps (si se usa)
-keep class com.google.android.gms.maps.** { *; }
-dontwarn com.google.android.gms.maps.**

# Google Location
-keep class com.google.android.gms.location.** { *; }
-dontwarn com.google.android.gms.location.**

# Google Auth
-keep class com.google.android.gms.auth.** { *; }
-dontwarn com.google.android.gms.auth.**

# ----------------------------------------------------------------------------
# OAUTH - GOOGLE SIGN IN
# ----------------------------------------------------------------------------

-keep class com.google.android.gms.auth.api.signin.** { *; }
-dontwarn com.google.android.gms.auth.api.signin.**

# Plugin OAuth
-keep class com.codetrix.capacitor.** { *; }
-dontwarn com.codetrix.capacitor.**

# ----------------------------------------------------------------------------
# OAUTH - FACEBOOK
# ----------------------------------------------------------------------------

-keep class com.facebook.** { *; }
-dontwarn com.facebook.**

-keepattributes Signature
-keepattributes *Annotation*
-keepattributes EnclosingMethod
-keepattributes InnerClasses

# ----------------------------------------------------------------------------
# OAUTH - APPLE SIGN IN
# ----------------------------------------------------------------------------

-keep class com.signinwithapple.** { *; }
-dontwarn com.signinwithapple.**

# ----------------------------------------------------------------------------
# HTTP - OKHTTP & RETROFIT
# ----------------------------------------------------------------------------

# OkHttp
-keep class okhttp3.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# Retrofit
-keep class retrofit2.** { *; }
-dontwarn retrofit2.**

-keepattributes Signature
-keepattributes Exceptions

# Retrofit interfaces
-keep,allowobfuscation,allowshrinking interface retrofit2.Call
-keep,allowobfuscation,allowshrinking class retrofit2.Response
-keep,allowobfuscation,allowshrinking class kotlin.coroutines.Continuation

# ----------------------------------------------------------------------------
# JSON - GSON
# ----------------------------------------------------------------------------

# Gson
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**

# Mantener clases de modelos con Gson
-keep class * implements com.google.gson.JsonSerializer { *; }
-keep class * implements com.google.gson.JsonDeserializer { *; }

# Mantener campos de clases serializadas
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# ----------------------------------------------------------------------------
# JSON - JACKSON
# ----------------------------------------------------------------------------

-keep class com.fasterxml.jackson.** { *; }
-dontwarn com.fasterxml.jackson.**

# ----------------------------------------------------------------------------
# WEBVIEW - JAVASCRIPT INTERFACE
# ----------------------------------------------------------------------------

# Mantener métodos anotados con @JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Mantener WebView
-keep class android.webkit.WebView { *; }
-keepclassmembers class android.webkit.WebView {
    public *;
}

# ----------------------------------------------------------------------------
# KOTLIN
# ----------------------------------------------------------------------------

-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**

-keep class kotlinx.** { *; }
-dontwarn kotlinx.**

-keepclassmembers class **$WhenMappings {
    <fields>;
}

-keepclassmembers class kotlin.Metadata {
    public <methods>;
}

# ----------------------------------------------------------------------------
# ANDROIDX
# ----------------------------------------------------------------------------

-keep class androidx.** { *; }
-dontwarn androidx.**

# AndroidX Core
-keep class androidx.core.** { *; }
-dontwarn androidx.core.**

# AndroidX AppCompat
-keep class androidx.appcompat.** { *; }
-dontwarn androidx.appcompat.**

# AndroidX Fragment
-keep class androidx.fragment.** { *; }
-dontwarn androidx.fragment.**

# AndroidX Lifecycle
-keep class androidx.lifecycle.** { *; }
-dontwarn androidx.lifecycle.**

# AndroidX Work Manager (si se usa)
-keep class androidx.work.** { *; }
-dontwarn androidx.work.**

# ----------------------------------------------------------------------------
# CORDOVA (SI SE USA)
# ----------------------------------------------------------------------------

-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**

# ----------------------------------------------------------------------------
# SQLITE / ROOM (SI SE USA)
# ----------------------------------------------------------------------------

-keep class androidx.room.** { *; }
-dontwarn androidx.room.**

-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
-keepclassmembers class * {
    @androidx.room.** *;
}

# ----------------------------------------------------------------------------
# ENCRYPTION / SECURITY
# ----------------------------------------------------------------------------

# Mantener clases de encriptación
-keep class javax.crypto.** { *; }
-dontwarn javax.crypto.**

-keep class java.security.** { *; }
-dontwarn java.security.**

# ----------------------------------------------------------------------------
# NOTIFICATIONS
# ----------------------------------------------------------------------------

# Mantener clases de notificaciones
-keep class android.app.Notification { *; }
-keep class android.app.NotificationManager { *; }

# ----------------------------------------------------------------------------
# GEOFENCING
# ----------------------------------------------------------------------------

-keep class com.google.android.gms.location.Geofence { *; }
-keep class com.google.android.gms.location.GeofencingRequest { *; }

# ----------------------------------------------------------------------------
# NATIVE CODE (JNI)
# ----------------------------------------------------------------------------

# Mantener métodos nativos
-keepclasseswithmembernames class * {
    native <methods>;
}

# ----------------------------------------------------------------------------
# REFLEXIÓN
# ----------------------------------------------------------------------------

# Mantener clases que usan reflexión
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# ----------------------------------------------------------------------------
# WARNINGS COMUNES
# ----------------------------------------------------------------------------

# Suprimir warnings de librerías de terceros
-dontwarn javax.annotation.**
-dontwarn javax.inject.**
-dontwarn sun.misc.Unsafe
-dontwarn com.google.common.**
-dontwarn org.joda.time.**
-dontwarn org.slf4j.**
-dontwarn org.apache.log4j.**

# ----------------------------------------------------------------------------
# DEBUGGING
# ----------------------------------------------------------------------------

# Para debugging, descomentar esta línea para ver qué se está eliminando:
# -printusage unused.txt

# Para ver qué se está manteniendo:
# -printseeds seeds.txt

# Para ver el mapeo de ofuscación:
# -printmapping mapping.txt

# ----------------------------------------------------------------------------
# CUSTOM - UDAR EDGE
# ----------------------------------------------------------------------------

# Mantener clases de modelos de tu app (AJUSTAR SEGÚN TU PACKAGE)
-keep class com.udaredge.app.models.** { *; }
-keepclassmembers class com.udaredge.app.models.** { *; }

# Mantener clases de API/DTOs
-keep class com.udaredge.app.api.** { *; }
-keepclassmembers class com.udaredge.app.api.** { *; }

# Mantener clases de servicios
-keep class com.udaredge.app.services.** { *; }
-keepclassmembers class com.udaredge.app.services.** { *; }

# ----------------------------------------------------------------------------
# FIN DE PROGUARD RULES
# ============================================================================
#
# 📚 DOCUMENTACIÓN:
# https://www.guardsquare.com/manual/configuration/usage
#
# 🧪 TESTING:
# Siempre probar la APK release en dispositivos reales antes de publicar
#
# ⚠️ NOTA:
# Estas reglas son exhaustivas para evitar crashes en producción.
# Puedes optimizar removiendo plugins que no uses.
#
# ============================================================================
