# Vercel Environment Variables

Vercel par deploy karne ke liye yeh environment variables add karein:

## Vercel Dashboard mein kaise add karein:

1. Vercel project mein jao
2. **Settings** → **Environment Variables** section mein jao
3. Neeche diye gaye har variable ko add karein:

---

## Required Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDiBX_-Uw4in7JiTl43kHhx2T49WRKYLfw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kazvan-d195c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kazvan-d195c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kazvan-d195c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=528654827500
NEXT_PUBLIC_FIREBASE_APP_ID=1:528654827500:web:343445896d2d55c38bcac9
```

## Optional (Analytics ke liye):

```
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Note:** Agar aapke paas `MEASUREMENT_ID` nahi hai, to yeh skip kar sakte hain. Analytics kaam karega bina iske bhi.

---

## Step-by-Step Instructions:

1. **Vercel Dashboard** kholo: https://vercel.com/dashboard
2. Apne project ko select karo
3. **Settings** tab par click karo
4. Left sidebar se **Environment Variables** select karo
5. Har variable ko individually add karo:
   - **Key** field mein variable name paste karo (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - **Value** field mein value paste karo
   - **Environment** select karo: Production, Preview, Development (ya sab select karo)
   - **Add** button click karo
6. Sab variables add karne ke baad, **Redeploy** karo

---

## Important Notes:

- ✅ Sab variables `NEXT_PUBLIC_` se start hote hain (client-side accessible)
- ✅ Variables add karne ke baad **redeploy** zaroori hai
- ✅ Production, Preview, aur Development environments ke liye alag-alag set kar sakte hain
- ✅ Values Firebase Console se bhi mil sakti hain (Project Settings → General → Your apps)

---

## Quick Copy-Paste (Vercel CLI se):

Agar aap CLI use karna chahte hain:

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
```

Har command ke baad value enter karni hogi.

